import { type NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const accessToken = getCookie('access_token', { req: request });

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

    // Create promises for all additional data fetching
    const dataPromises = repos.map((repo: any) => {
      const languagePromise = axios.get(repo.languages_url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(response => response.data).catch(error => {
        console.error(`Failed to fetch languages for ${repo.full_name}`, error);
        return {}; // Return empty object on error
      });

      const contributorPromise = axios.get(repo.contributors_url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(response => response.data.length).catch(error => {
        console.error(`Failed to fetch contributors for ${repo.full_name}`, error);
        return 0; // Return 0 on error
      });

      return Promise.all([languagePromise, contributorPromise]);
    });

    const additionalData = await Promise.all(dataPromises);

    // Add all fetched data to each repo object
    const reposWithData = repos.map((repo: any, index: number) => ({
      ...repo,
      languages: additionalData[index][0],
      contributor_count: additionalData[index][1],
    }));

    return NextResponse.json(reposWithData);
  } catch (error) {
    console.error(error);
    return new Response('Error fetching repositories', { status: 500 });
  }
}