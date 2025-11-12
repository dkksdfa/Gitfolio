import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/cache';

// Simple concurrency limiter
async function mapWithLimit<T, R>(items: T[], fn: (t: T) => Promise<R>, limit = 6) {
  const results: Promise<R>[] = [];
  const executing: Promise<any>[] = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.push(p);
    const clean = () => {
      const idx = executing.indexOf(p);
      if (idx > -1) executing.splice(idx, 1);
    };
    p.then(clean).catch(clean);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

export async function GET(request: NextRequest) {
  // Use NextRequest cookies API for App Router compatibility
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        affiliation: 'owner,collaborator,organization_member',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      }
    });



    const repos = reposResponse.data;

    // Fetch additional data (languages, contributor_count) with concurrency limit and caching
    const augment = async (repo: any) => {
      const langKey = `lang:${repo.full_name}`;
      const contribKey = `contrib:${repo.full_name}`;

      let languages = cacheGet(langKey);
      if (!languages) {
        try {
          const res = await axios.get(repo.languages_url, { headers: { Authorization: `Bearer ${accessToken}` } });
          languages = res.data;
          cacheSet(langKey, languages);
        } catch (e) {
          console.warn(`Failed to fetch languages for ${repo.full_name}`, e);
          languages = {};
        }
      }

      let contributor_count = cacheGet(contribKey);
      if (contributor_count == null) {
        try {
          const res = await axios.get(repo.contributors_url, { headers: { Authorization: `Bearer ${accessToken}` } });
          contributor_count = Array.isArray(res.data) ? res.data.length : 0;
          cacheSet(contribKey, contributor_count);
        } catch (e) {
          console.warn(`Failed to fetch contributors for ${repo.full_name}`, e);
          contributor_count = 0;
        }
      }

      return { repo, languages, contributor_count };
    };

    const augmented = await mapWithLimit(repos, augment, 6);

    const reposWithData = augmented.map(({ repo, languages, contributor_count }) => ({
      ...repo,
      languages,
      contributor_count,
    }));


    return NextResponse.json(reposWithData);
  } catch (error) {
    console.error('Error fetching repos:', error);
    return new Response('Failed to fetch repositories', { status: 500 });
  }
}