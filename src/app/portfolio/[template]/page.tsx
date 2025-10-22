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
      import(`@/templates/${template}.tsx`)
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

  return <TemplateComponent user={user} repos={repos} />;
};

export default PortfolioPage;
