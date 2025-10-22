
import { type NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const accessToken = getCookie('access_token', { req: request });

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return new Response('Error fetching user data', { status: 500 });
  }
}
