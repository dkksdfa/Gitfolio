
import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // Use NextRequest cookies API for App Router compatibility
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return new Response('Error fetching user data', { status: 500 });
  }
}
