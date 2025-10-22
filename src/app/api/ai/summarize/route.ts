import { type NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to decode Base64 content
function decodeBase64(encoded: string) {
  return Buffer.from(encoded, 'base64').toString('utf8');
}

// Check for API Key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing Gemini API Key in .env.local");
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  const accessToken = getCookie('access_token', { req: request });

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { owner, repo, title, description } = await request.json();

  if (!owner || !repo) {
    return new Response('Missing owner or repo name', { status: 400 });
  }

    try {
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
  
      let commitMessages = 'No recent commits found.';
      if (commitsResult.status === 'fulfilled' && commitsResult.value.data.length > 0) {
        commitMessages = commitsResult.value.data
          .map((c: any) => `- ${c.commit.message}`)
          .join('\n');
      }
  
      // --- 4. Construct the Prompt based on project type ---
      let prompt = '';
      if (isTeamProject) {
          prompt = `
                    The goal is to generate a project description and a user's role summary for a portfolio.
                    Analyze the following information about the project '${title}' and the user '${user.login}'.
  
                    - User's Commits:
                    ---
                    ${commitMessages}
                    ---
                    - Project README.md (for context):
                    ---
                    ${readmeContent.substring(0, 2000)}...
                    ---
  
                    Generate a valid JSON object with two keys: "description" and "role".
                    - "description": A concise, professional summary of the project in Korean (1-2 sentences).
                    - "role": A summary of the main role and contributions of user '${user.login}' in Korean (1-2 sentences).
  
                    Your output MUST be a valid JSON object.
                    Example:
                    {
                      "description": "이 프로젝트는 ...하는 웹사이트입니다.",
                      "role": "회원가입, 로그인 등 사용자 인증 시스템을 개발했으며..."
                    }
  
                    JSON Output:
                  `;
      } else {
          prompt = `
                    The goal is to generate a project description and a user's role summary for a portfolio.
                    This is a solo project by '${user.login}'. Analyze the following information about the project '${title}'.
  
                    - Project Commits:
                    ---
                    ${commitMessages}
                    ---
                    - Project README.md:
                    ---
                    ${readmeContent.substring(0, 3000)}...
                    ---
  
                    Generate a valid JSON object with two keys: "description" and "role".
                    - "description": A concise, professional summary of the project in Korean (1-2 sentences).
                    - "role": A summary of the user's role. Since this is a solo project, describe the overall development role, like "Overall project planning, design, and full-stack development." in Korean (1-2 sentences).
  
                    Your output MUST be a valid JSON object.
                    Example:
                    {
                      "description": "이 프로젝트는 ...하는 웹사이트입니다.",
                      "role": "프로젝트 기획, 디자인, 풀스택 개발 등 모든 과정을 총괄하여 진행했습니다."
                    }
  
                    JSON Output:
                  `;
      }
  
      // --- 5. Call Gemini API ---
      console.log("--- Sending Prompt to Gemini ---\n", prompt);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent(prompt);
      const aiResponseText = result.response.text();
  
      // --- 6. Parse and Format Response ---
      const jsonRegex = /```json\n([\s\S]*?)\n```/;
      const match = aiResponseText.match(jsonRegex);
      const jsonString = match ? match[1] : aiResponseText;
      
      let formattedSummary = '';
      try {
          const parsed = JSON.parse(jsonString);
          formattedSummary = `[프로젝트 설명]\n${parsed.description}\n\n[주요 역할]\n${parsed.role}`;
      } catch (e) {
          console.error("Failed to parse AI response as JSON:", e);
          formattedSummary = aiResponseText; // Fallback to raw text
      }
  
      return NextResponse.json({ summary: formattedSummary });
  
    } catch (error) {
      console.error("Error in /api/ai/summarize:", error);
      return new Response('Error generating AI summary.', { status: 500 });
    }}
