'use client';

import React, { useEffect, useState, ComponentType } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

// Define interfaces as they are in the main page
interface User {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  contributor_count: number;
  languages: { [key: string]: number };
  updated_at: string;
}

const PortfolioPage = () => {
  const params = useParams();
  const router = useRouter();
  const template = params.template as string;

  const [TemplateComponent, setTemplateComponent] = useState<ComponentType<any> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      // Use relative import to ensure bundler can resolve the template files
      import(`../../../templates/${template}.tsx`)
        .then(module => setTemplateComponent(() => module.default))
        .catch(() => {
          setError(`Template "${template}" not found.`);
          setLoading(false);
        });
    }
  }, [template]);

  useEffect(() => {
    const loadDataFromStorage = () => {
      try {
        const storedProfile = localStorage.getItem('portfolio_profile');
        if (!storedProfile) {
          setError('포트폴리오 데이터가 없습니다. 메인 페이지에서 저장 후 다시 시도하세요.');
          return;
        }

        const profile = JSON.parse(storedProfile);

        // Build a minimal `user` object expected by templates
        const userFromProfile = {
          login: profile.github ? (profile.github.replace(/https?:\/\//, '').split('/')[1] || profile.name) : profile.name || 'user',
          name: profile.name || '',
          avatar_url: profile.avatar_url || profile.avatar || '',
          html_url: profile.github || '',
          bio: profile.intro || '',
          title: profile.title || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          blog: profile.resumeUrl || '',
          blogUrl: profile.blogUrl || '',
          blogPosts: profile.blogPosts || [],
          skills: profile.skills || [],
          careers: profile.careers || []
        };

        const reposFromProfile = (profile.projects || []).map((p: any, idx: number) => ({
          id: p.id || (idx + 1),
          name: p.name || `project-${idx + 1}`,
          html_url: p.url || p.html_url || '#',
          description: p.description || '',
          stargazers_count: p.stargazers_count || 0,
          contributor_count: p.contributor_count || 0,
          languages: p.languages || {},
          created_at: p.created_at || '',
          updated_at: p.updated_at || new Date().toISOString(),
          period: p.period || ''
        }));

        setUser(userFromProfile as any);
        setRepos(reposFromProfile as any);
      } catch (err) {
        setError('Failed to load portfolio data from storage.');
      } finally {
        setLoading(false);
      }
    };

    if (TemplateComponent) {
      loadDataFromStorage();
    }
  }, [TemplateComponent]);

  // If viewing the `cdg` template, inject the original CSS files from public/templates/cdg
  useEffect(() => {
    // previously used to inject cdg preview CSS; no-op now (approach cancelled)
  }, [template]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading Portfolio...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">Error: {error}</div>;
  }

  if (!TemplateComponent) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Template not found.</div>;
  }

  const handleDownload = async () => {
    try {
      const el = document.getElementById('portfolio-root');
      if (!el) return;

      // Clone the element to modify it without affecting the view
      const clone = el.cloneNode(true) as HTMLElement;

      // Helper to convert URL to Data URI
      const toDataURL = async (url: string) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Failed to load image', url, e);
          return null;
        }
      };

      // 1. Process <img> tags
      const imgs = clone.querySelectorAll('img');
      for (const img of Array.from(imgs)) {
        if (img.src && !img.src.startsWith('data:')) {
          const dataUrl = await toDataURL(img.src);
          if (dataUrl) img.src = dataUrl;
        }
      }

      // 2. Process background images in style attributes
      const elementsWithStyle = clone.querySelectorAll('[style*="url("]');
      for (const element of Array.from(elementsWithStyle)) {
        const style = (element as HTMLElement).style;
        const bg = style.backgroundImage;
        if (bg && bg.includes('url(')) {
          const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
          if (match && match[1]) {
            const url = match[1];
            if (!url.startsWith('data:')) {
              const dataUrl = await toDataURL(url);
              if (dataUrl) {
                style.backgroundImage = bg.replace(match[0], `url('${dataUrl}')`);
              }
            }
          }
        }
      }

      const inner = clone.innerHTML;

      const tailwindConfig = `
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Noto Sans KR', 'sans-serif'],
                },
                colors: {
                  'mm-bg': '#F9FAFB',
                  'mm-text': '#111827',
                  'mm-sub': '#6B7280',
                  'mm-accent': '#5865F2',
                  'mm-accent-hover': '#4752C4',
                  'mm-border': '#E5E7EB',
                  'cdg-yellow': '#f9c51d',
                  'cdg-dark': '#222222',
                  'cdg-muted': '#6c757d',
                  'cdg-black': '#000000',
                }
              }
            }
          }
        </script>
      `;

      const full = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script>${tailwindConfig}<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet"><style>body { font-family: 'Noto Sans KR', sans-serif; }</style><title>${template} - portfolio</title></head><body>${inner}</body></html>`;

      const blob = new Blob([full], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template}-portfolio.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      alert('다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Action Buttons */}
      <div className="fixed top-6 right-6 z-[100] flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-white/90 backdrop-blur-md text-gray-700 font-bold rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all border border-gray-200 text-sm"
        >
          뒤로
        </button>
        <button
          onClick={handleDownload}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all text-sm"
        >
          포트폴리오 다운로드
        </button>
      </div>

      <div id="portfolio-root">
        <TemplateComponent user={user} repos={repos} />
      </div>
    </div>
  );
};

export default PortfolioPage;
