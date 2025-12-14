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

    // --- 3. Fetch README and Languages (can run in parallel with commits) ---
    const readmePromise = axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const languagesPromise = axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const [readmeResult, commitsResult, languagesResult] = await Promise.allSettled([
      readmePromise,
      commitsPromise,
      languagesPromise,
    ]);

    let readmeContent = 'No README file found.';
    if (readmeResult.status === 'fulfilled' && readmeResult.value.data.content) {
      readmeContent = decodeBase64(readmeResult.value.data.content);
    }

    let languages = [];
    if (languagesResult.status === 'fulfilled') {
      languages = Object.keys(languagesResult.value.data);
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

    const prompt = `Analyze the following GitHub project and generate a structured portfolio entry in Korean.

Project Title: ${title}
User's Description: ${description}
Project Type: ${isTeamProject ? 'Team Project' : 'Personal Project'}
My Role: ${isTeamProject ? `I was one of ${contributors.length} contributors.` : 'I was the sole developer.'}
Languages Used: ${languages.join(', ')}
My Commits (${commitCount}):
${commitMessages.slice(0, 15).join('\n')}

README.md:
${readmeContent.slice(0, 3000)}

Based on this information, please generate a JSON object with the following fields:
1. "description": A concise and professional project description (2-4 sentences, Korean).
2. "summary": A bullet-point summary of key features and my contributions (use "- " for bullets, ensure each item is separated by a newline character, Korean).
3. "techs": An array of technical stacks used (e.g., ["React", "TypeScript", "Tailwind CSS"]). Infer from README and Languages.
4. "period": Estimated project period (e.g., "2023.01 - 2023.03"). Infer from commit dates or README. If unknown, leave empty.

Output ONLY the JSON object. Do not include markdown formatting like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks if the model ignores instructions
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);

      // Post-process summary to ensure newlines
      if (parsedData.summary && typeof parsedData.summary === 'string') {
        if (parsedData.summary.includes('- ') && !parsedData.summary.includes('\n')) {
          // Replace " - " with "\n- " if it seems to be an inline list
          parsedData.summary = parsedData.summary.replace(/(\S)\s+-\s/g, '$1\n- ');
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON from LLM", text);
      // Fallback to simple text if JSON parsing fails
      parsedData = {
        description: text,
        summary: '',
        techs: languages,
        period: ''
      };
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error generating summary:', error.response?.data || error.message);
    return new Response(JSON.stringify({ error: 'Failed to generate summary' }), { status: 500 });
  }
}

