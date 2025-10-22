'use client';

import React from 'react';

interface User {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  contributor_count: number;
  languages: { [key: string]: number };
  updated_at: string;
}

interface TemplateOneProps {
  user: User | null;
  repos: Repo[] | null;
}

const TemplateOne: React.FC<TemplateOneProps> = ({ user, repos }) => {
  if (!user || !repos) {
    return <div className="text-center text-white">Loading data...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-gray-800 text-white p-8 text-center">
        <img src={user.avatar_url} alt={user.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-700" />
        <h1 className="text-4xl font-bold">{user.name}</h1>
        <p className="text-xl text-gray-400">@{user.login}</p>
        <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          View GitHub Profile
        </a>
      </header>

      <main className="p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">My Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {repos.map(repo => (
            <div key={repo.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {repo.name}
                  </a>
                </h3>
                <p className="text-gray-600 mb-4 h-24 overflow-y-auto">{repo.description || 'No description available.'}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <span className="mr-1">★</span>
                    <span>{repo.stargazers_count}</span>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">👥</span>
                    <span>{repo.contributor_count}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(repo.languages).map(lang => (
                    <span key={lang} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {lang}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-right">Last updated: {new Date(repo.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TemplateOne;