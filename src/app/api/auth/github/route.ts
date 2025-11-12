
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const githubClientId = process.env.GITHUB_CLIENT_ID;

  // Use the request origin (includes host + port) so redirects match the current dev server port
  const origin = request.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${origin}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=repo+read:user+read:org`;

  // Return a redirect response compatible with Route Handlers
  return NextResponse.redirect(url);
}
