import { type NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import axios from 'axios';

async function getUserLogin(accessToken: string): Promise<string> {
  const userResponse = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return userResponse.data.login;
}

export async function GET(request: NextRequest) {
  const accessToken = getCookie('access_token', { req: request });

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
      axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(res => res.data)
    );
    const reposFromPRs = await Promise.all(repoFromPRsPromises);

    // --- Process commit results ---
    const commits = commitResponse.data.items;
    // These are minimal repo objects, so we need to fetch the full versions
    const commitRepoUrls = new Set<string>(
      commits.map((commit: any) => commit.repository.url).filter(Boolean)
    );
    const repoFromCommitsPromises = Array.from(commitRepoUrls).map(url =>
      axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(res => res.data)
    );
    const reposFromCommits = await Promise.all(repoFromCommitsPromises);

    // --- Combine and de-duplicate ---
    const allRepos = [...reposFromPRs, ...reposFromCommits];
    const uniqueRepos = new Map<number, any>();
    allRepos.forEach(repo => {
      if(repo) uniqueRepos.set(repo.id, repo);
    });

    const finalRepoList = Array.from(uniqueRepos.values());
    
    // --- Augment with language and contributor data ---
    const dataPromises = finalRepoList.map((repo: any) => {
      const languagePromise = axios.get(repo.languages_url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(response => response.data).catch(() => ({}));

      const contributorPromise = axios.get(repo.contributors_url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(response => response.data.length).catch(() => 0);

      return Promise.all([languagePromise, contributorPromise]);
    });

    const additionalData = await Promise.all(dataPromises);

    const reposWithData = finalRepoList.map((repo: any, index: number) => ({
      ...repo,
      languages: additionalData[index][0],
      contributor_count: additionalData[index][1],
    }));

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
