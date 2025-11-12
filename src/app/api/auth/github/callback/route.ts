import { NextResponse, type NextRequest } from 'next/server';
import axios, { isAxiosError } from 'axios';
import { setCookie } from 'cookies-next';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code) {
    return new Response('Code not found', { status: 400 });
  }

  if (!githubClientId || !githubClientSecret) {
    return new Response('GitHub OAuth not configured', { status: 500 });
  }

  let accessToken;
  try {
    const params = new URLSearchParams();
    params.append('client_id', githubClientId!);
    params.append('client_secret', githubClientSecret!);
    params.append('code', code);

    const axiosResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      params,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    accessToken = axiosResponse.data.access_token;
  } catch (error) {
    console.error("Error during GitHub token exchange:");
    if (isAxiosError(error)) {
      console.error("GitHub API response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    return new Response('Error getting access token', { status: 500 });
  }

  if (!accessToken) {
    return new Response('Access token not found in GitHub response', { status: 400 });
  }

  // Redirect logic is now outside the try...catch block
  const response = NextResponse.redirect(new URL('/', request.url));
  // Set cookie with secure options
  setCookie('access_token', accessToken, {
    req: request,
    res: response,
    maxAge: 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}