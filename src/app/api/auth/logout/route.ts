import { NextResponse, type NextRequest } from 'next/server';
import { deleteCookie } from 'cookies-next';

export async function GET(request: NextRequest) {
  // Create a response object by redirecting
  const response = NextResponse.redirect(new URL('/', request.url));

  // Delete the cookie on that response object
  deleteCookie('access_token', { req: request, res: response });

  // Return the response
  return response;
}