import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/cache';

// Helper function to handle pagination for GitHub API calls
async function fetchAllPages(url: string, accessToken: string, params: any = {}): Promise<any[]> {
    let allItems: any[] = [];
    let nextUrl: string | null = `${url}?${new URLSearchParams(params).toString()}`;

    while (nextUrl) {
        try {
            const response = await axios.get(nextUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // For search APIs, the items are in response.data.items
            if (response.data.items) {
                allItems = allItems.concat(response.data.items);
            } else { // For other list APIs like /user/repos
                allItems = allItems.concat(response.data);
            }

            const linkHeader = response.headers['link'];
            nextUrl = null; // Assume no next page unless we find one
            if (linkHeader) {
                const links = linkHeader.split(',');
                const nextLink = links.find((s: string) => s.includes('rel="next"'));
                if (nextLink) {
                    const match = nextLink.match(/<([^>]+)>/);
                    if (match) {
                        nextUrl = match[1];
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching page: ${nextUrl}`, error);
            break; // Stop pagination on error
        }
    }
    return allItems;
}


// Helper function to get user login
async function getUserLogin(accessToken: string): Promise<string> {
    const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return userResponse.data.login;
}

// Helper function to get commit stats
async function getCommitStats(owner: string, repo: string, accessToken: string, login: string): Promise<number> {
    try {
        // First, try to get the commit count directly from the commits API with the author filter.
        // This is more reliable than the contributor stats API.
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { author: login, per_page: 1 }, // We only need one to get the Link header
        });

        // The total number of commits is in the 'Link' header.
        // It looks like: <...&page=2>; rel="next", <...&page=34>; rel="last"
        const linkHeader = response.headers['link'];
        if (linkHeader) {
            const lastLink = linkHeader.split(',').find((s: string) => s.includes('rel="last"'));
            if (lastLink) {
                const match = lastLink.match(/&page=(\d+)/);
                if (match) {
                    return parseInt(match[1], 10);
                }
            }
        }

        // If there's no Link header, it means there's only one page of results.
        // We can't just return response.data.length because we set per_page=1.
        // So we need to make another request without pagination to count.
        const allCommitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { author: login },
        });
        return allCommitsResponse.data.length;

    } catch (error) {
        // This can happen for various reasons, e.g., an empty repo.
        // In such cases, the commit count is 0.
        return 0;
    }
}


// Helper function to augment repo data
async function mapWithLimit<T, R>(items: T[], fn: (t: T) => Promise<R>, limit = 6) {
    const results: Promise<R>[] = [];
    const executing: Promise<any>[] = [];
    for (const item of items) {
        const p = Promise.resolve().then(() => fn(item));
        results.push(p);
        executing.push(p);
        const clean = () => { const idx = executing.indexOf(p); if (idx > -1) executing.splice(idx, 1); };
        p.then(clean).catch(clean);
        if (executing.length >= limit) await Promise.race(executing);
    }
    return Promise.all(results);
}

async function augmentRepoData(repos: any[], accessToken: string, login: string): Promise<any[]> {
    const augment = async (repo: any) => {
        const langKey = `lang:${repo.full_name}`;
        const contribKey = `contrib:${repo.full_name}`;
        const commitKey = `commit:${repo.full_name}`;

        let languages = cacheGet(langKey);
        if (!languages) {
            try {
                const res = await axios.get(repo.languages_url, { headers: { Authorization: `Bearer ${accessToken}` } });
                languages = res.data; cacheSet(langKey, languages);
            } catch (e) {
                console.warn(`Failed to fetch languages for ${repo.full_name}`, e);
                languages = {};
            }
        }
        let contributor_count = cacheGet(contribKey);
        if (contributor_count == null) {
            try {
                const res = await axios.get(repo.contributors_url, { headers: { Authorization: `Bearer ${accessToken}` } });
                contributor_count = Array.isArray(res.data) ? res.data.length : 0; cacheSet(contribKey, contributor_count);
            } catch (e) {
                console.warn(`Failed to fetch contributors for ${repo.full_name}`, e);
                contributor_count = 0;
            }
        }

        let commit_count = cacheGet(commitKey);
        if (commit_count == null) {
            try {
                commit_count = await getCommitStats(repo.owner.login, repo.name, accessToken, login);
                cacheSet(commitKey, commit_count);
            } catch (e) {
                console.warn(`Failed to fetch commit stats for ${repo.full_name}`, e);
                commit_count = 0;
            }
        }

        return { repo, languages, contributor_count, commit_count };
    };

    const augmented = await mapWithLimit(repos, augment, 6);
    return augmented.map(({ repo, languages, contributor_count, commit_count }) => ({
        ...repo,
        languages,
        contributor_count,
        commit_count,
    }));
}


export async function GET(request: NextRequest) {
    // Use NextRequest cookies API for App Router compatibility
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const login = await getUserLogin(accessToken);


        // --- Fetch affiliated and contributed repos in parallel ---
        const affiliatedPromise = axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                affiliation: 'owner,collaborator,organization_member',
                sort: 'updated',
                per_page: 100,
            }
        });

        const contributedPrPromise = axios.get('https://api.github.com/search/issues', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { q: `author:${login} is:pr is:merged`, per_page: 100 },
        });

        // --- NEW: Search for commits to find more contributed repos ---
        const contributedCommitPromise = axios.get('https://api.github.com/search/commits', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.cloak-preview+json', // Required for commit search
            },
            params: { q: `author:${login}`, per_page: 100 },
        });

        const [affiliatedResult, contributedPrResult, contributedCommitResult] = await Promise.allSettled([
            affiliatedPromise,
            contributedPrPromise,
            contributedCommitPromise,
        ]);

        const allReposMap = new Map<number, any>();

        // Process affiliated repos
        if (affiliatedResult.status === 'fulfilled') {
            affiliatedResult.value.data.forEach((repo: any) => {
                allReposMap.set(repo.id, repo);
            });
        } else {
            console.warn("Failed to fetch affiliated repos:", affiliatedResult.reason);
        }

        // Process contributed repos from PRs
        if (contributedPrResult.status === 'fulfilled') {
            const repoUrls = new Set<string>(
                contributedPrResult.value.data.items.map((pr: any) => pr.repository_url)
            );

            const repoPromises = Array.from(repoUrls).map(url =>
                axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } })
                    .then(res => res.data)
                    .catch(err => { console.warn('Failed to fetch repo from PR url', url, err); return null; })
            );

            const contributedRepos = await Promise.all(repoPromises);
            contributedRepos.forEach(repo => {
                if (repo) { // Check if repo is not null
                    allReposMap.set(repo.id, repo);
                }
            });
        } else {
            console.warn("Failed to fetch contributed repos from PRs:", contributedPrResult.reason);
        }

        // --- NEW: Process contributed repos from Commits ---
        if (contributedCommitResult.status === 'fulfilled') {
            const commitRepos = contributedCommitResult.value.data.items.map((commit: any) => commit.repository);
            commitRepos.forEach((repo: any) => {
                allReposMap.set(repo.id, repo);
            });
        } else {
            console.warn("Failed to fetch contributed repos from commits:", contributedCommitResult.reason);
        }

        // Convert the map back to an array
        const allRepos = Array.from(allReposMap.values());

        // --- Augment repo data ---
        const augmentedRepos = await augmentRepoData(allRepos, accessToken, login);

        return NextResponse.json(augmentedRepos);
    } catch (error) {
        console.error('Error fetching repos:', error);
        return new Response('Error fetching repos', { status: 500 });
    }
}
