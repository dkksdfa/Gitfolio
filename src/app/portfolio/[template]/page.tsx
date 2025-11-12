'use client';

import React, { useEffect, useState, ComponentType } from 'react';
import { useParams } from 'next/navigation';
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
        const storedUser = localStorage.getItem('portfolio_user');
        const storedRepos = localStorage.getItem('portfolio_repos');

        if (storedUser && storedRepos) {
          setUser(JSON.parse(storedUser));
          setRepos(JSON.parse(storedRepos));
        } else {
          setError('Portfolio data not found. Please generate it from the main page.');
        }
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading Portfolio...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">Error: {error}</div>;
  }

  if (!TemplateComponent) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Template not found.</div>;
  }

  const handleDownload = () => {
    try {
      const el = document.getElementById('portfolio-root');
      if (!el) return;
      const inner = el.innerHTML;
      const full = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><title>${template} - portfolio</title></head><body>${inner}</body></html>`;
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
      <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">포트폴리오 미리보기</h1>
        <div className="space-x-2">
          <button onClick={handleDownload} className="px-3 py-2 bg-indigo-600 text-white rounded">포트폴리오 다운로드</button>
        </div>
      </div>
      <div id="portfolio-root">
        <TemplateComponent user={user} repos={repos} />
      </div>
    </div>
  );
};

export default PortfolioPage;
