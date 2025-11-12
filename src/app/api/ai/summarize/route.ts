import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to decode Base64 content
function decodeBase64(encoded: string) {
  return Buffer.from(encoded, 'base64').toString('utf8');
}

export async function POST(request: NextRequest) {
  // Use NextRequest cookies API for App Router compatibility
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { owner, repo, title, description } = await request.json();

  if (!owner || !repo) {
    return new Response('Missing owner or repo name', { status: 400 });
  }

  try {
    // Check for API Key inside handler so module import doesn't crash server start
    if (!process.env.GEMINI_API_KEY) {
      return new Response('Gemini API Key not configured', { status: 500 });
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // --- 1. Fetch contributors and current user in parallel ---
    const contributorsPromise = axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userPromise = axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const [contributorsResponse, userResponse] = await Promise.all([contributorsPromise, userPromise]);

    const contributors = contributorsResponse.data;
    const user = userResponse.data;
    const isTeamProject = contributors.length > 1;

    // --- 2. Fetch commits based on project type ---
    let commitParams: any = { per_page: 100 };
    if (isTeamProject) {
      commitParams.author = user.login;
    }

    const commitsPromise = axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: commitParams,
    });

    // --- 3. Fetch README (can run in parallel with commits) ---
    const readmePromise = axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const [readmeResult, commitsResult] = await Promise.allSettled([
      readmePromise,
      commitsPromise,
    ]);

    let readmeContent = 'No README file found.';
    if (readmeResult.status === 'fulfilled' && readmeResult.value.data.content) {
      readmeContent = decodeBase64(readmeResult.value.data.content);
    }

    let commitMessages: string[] = [];
    let commitCount = 0;
    if (commitsResult.status === 'fulfilled' && commitsResult.value.data.length > 0) {
      commitMessages = commitsResult.value.data.map((c: any) => `- ${c.commit.message}`);
      commitCount = commitMessages.length;
    }

    // --- 4. Construct the Prompt ---
    // Allow overriding model via env var in case the default isn't available in the account
    const modelId = process.env.GEMINI_MODEL || 'gemini-pro';
    const model = genAI.getGenerativeModel({ model: modelId });

    const prompt = `Analyze the following GitHub project and generate a concise and professional project description in Korean.

Project Title: ${title}
User's Description: ${description}
Project Type: ${isTeamProject ? 'Team Project' : 'Personal Project'}
My Role: ${isTeamProject ? `I was one of ${contributors.length} contributors.` : 'I was the sole developer.'}
My Commits (${commitCount}):
${commitMessages.slice(0, 15).join('\n')}

README.md:
${readmeContent}

Based on this information, please generate a new project description. The description should be:
- Written in Korean.
- 2-4 sentences long.
- Professional and suitable for a portfolio.
- Highlight key features and my contributions.
- Start with a clear opening like "이 프로젝트는..." or a similar phrase.
- Do not include any introductory text like "Here is the generated description:". Just provide the description itself.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      return NextResponse.json({ summary });
    } catch (genErr: any) {
      console.error('Error generating summary:', genErr);
      // Provide actionable message when the configured model isn't available
      const message = genErr?.message || String(genErr) || 'Failed to generate summary';
      return NextResponse.json({ error: 'Failed to generate summary', detail: message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error in summarize route:', error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: 'Unexpected server error', detail: msg }, { status: 500 });
  }
}
