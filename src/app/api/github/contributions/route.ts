import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/cache';

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

async function getUserLogin(accessToken: string): Promise<string> {
  const userResponse = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return userResponse.data.login;
}

export async function GET(request: NextRequest) {
  // Use NextRequest cookies API for App Router compatibility
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const login = await getUserLogin(accessToken);


    // --- Call 1: Search for merged PRs ---
    const prSearchPromise = axios.get('https://api.github.com/search/issues', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        q: `author:${login} is:pr is:merged`,
        per_page: 100,
      },
    });

    // --- Call 2: Search for commits ---
    const commitSearchPromise = axios.get('https://api.github.com/search/commits', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Special header required for Commit Search API
        Accept: 'application/vnd.github.cloak-preview+json',
      },
      params: {
        q: `author:${login}`,
        per_page: 100,
      },
    });

    const [prResponse, commitResponse] = await Promise.all([prSearchPromise, commitSearchPromise]);

    // --- Process PR results ---
    const pullRequests = prResponse.data.items;
    const repoUrls = new Set<string>(pullRequests.map((pr: any) => pr.repository_url));
    const repoFromPRsPromises = Array.from(repoUrls).map(url =>
      axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } }).then(res => res.data).catch(e => { console.warn('Failed to fetch repo from PR url', url, e); return null; })
    );
    const reposFromPRs = await Promise.all(repoFromPRsPromises);

    // --- Process commit results ---
    const commits = commitResponse.data.items;
    // These are minimal repo objects, so we need to fetch the full versions
    const commitRepoUrls = new Set<string>(
      commits.map((commit: any) => commit.repository.url).filter(Boolean)
    );
    const repoFromCommitsPromises = Array.from(commitRepoUrls).map(url =>
      axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } }).then(res => res.data).catch(e => { console.warn('Failed to fetch repo from commit url', url, e); return null; })
    );
    const reposFromCommits = await Promise.all(repoFromCommitsPromises);

    // --- Combine and de-duplicate ---
    const allRepos = [...reposFromPRs, ...reposFromCommits];
    const uniqueRepos = new Map<number, any>();
    allRepos.forEach(repo => {
      if (repo) uniqueRepos.set(repo.id, repo);
    });

    const finalRepoList = Array.from(uniqueRepos.values());

    // --- Augment with language and contributor data (with limit + cache) ---
    const augment = async (repo: any) => {
      const langKey = `lang:${repo.full_name}`;
      const contribKey = `contrib:${repo.full_name}`;
      let languages = cacheGet(langKey);
      if (!languages) {
        try {
          const res = await axios.get(repo.languages_url, { headers: { Authorization: `Bearer ${accessToken}` } });
          languages = res.data; cacheSet(langKey, languages);
        } catch (e) { console.warn(`Failed to fetch languages for ${repo.full_name}`, e); languages = {}; }
      }
      let contributor_count = cacheGet(contribKey);
      if (contributor_count == null) {
        try {
          const res = await axios.get(repo.contributors_url, { headers: { Authorization: `Bearer ${accessToken}` } });
          contributor_count = Array.isArray(res.data) ? res.data.length : 0; cacheSet(contribKey, contributor_count);
        } catch (e) { console.warn(`Failed to fetch contributors for ${repo.full_name}`, e); contributor_count = 0; }
      }
      return { repo, languages, contributor_count };
    };

    const augmented = await mapWithLimit(finalRepoList, augment, 6);
    const reposWithData = augmented.map(({ repo, languages, contributor_count }) => ({ ...repo, languages, contributor_count }));

    // --- Sort and return ---
    reposWithData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());


    return NextResponse.json(reposWithData);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
    }

    return new Response('Error fetching contributions', { status: 500 });
  }
}
