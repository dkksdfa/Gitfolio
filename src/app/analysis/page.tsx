'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[] | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [repoLoading, setRepoLoading] = useState<boolean>(false);
  const [showForks, setShowForks] = useState<boolean>(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template-one');

  // State for summary generation queue
  const [summarizingRepoId, setSummarizingRepoId] = useState<number | null>(null);
  const [summaryQueue, setSummaryQueue] = useState<number[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        setUser(null);
        router.push('/'); // Redirect to landing if not logged in
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  // Effect to process the summary queue
  useEffect(() => {
    if (summarizingRepoId === null && summaryQueue.length > 0) {
      const nextRepoId = summaryQueue[0];
      const repoToProcess = repos?.find(r => r.id === nextRepoId);

      if (repoToProcess) {
        setSummarizingRepoId(nextRepoId);
        setSummaryQueue(prevQueue => prevQueue.slice(1));

        const processSummary = async () => {
          try {
            const response = await axios.post('/api/ai/summarize', {
              owner: repoToProcess.owner.login,
              repo: repoToProcess.name,
              title: repoToProcess.name,
              description: repoToProcess.description,
            });
            const { summary } = response.data;
            handleRepoChange(nextRepoId, 'description', summary);
          } catch (error: any) {
            console.error('Failed to generate summary', error);
            handleRepoChange(nextRepoId, 'description', `[AI 요약 실패] ${error.message}`);
          } finally {
            setSummarizingRepoId(null);
          }
        };
        processSummary();
      }
    }
  }, [summaryQueue, summarizingRepoId, repos]);

  const fetchAffiliatedRepos = async () => {
    setRepoLoading(true);
    setRepoError(null);
    try {
      const response = await axios.get('/api/github/repos');
      setRepos(response.data);
    } catch (error) {
      setRepoError('소속된 저장소를 불러오는 데 실패했습니다.');
      setRepos(null);
    }
    setRepoLoading(false);
  };

  const fetchContributedRepos = async () => {
    setRepoLoading(true);
    setRepoError(null);
    try {
      const response = await axios.get('/api/github/contributions');
      setRepos(response.data);
    } catch (error) {
      setRepoError('기여한 저장소를 불러오는 데 실패했습니다.');
      setRepos(null);
    }
    setRepoLoading(false);
  };

  const handleRepoChange = (id: number, field: string, value: string) => {
    setRepos(prevRepos => 
      prevRepos?.map(repo => 
        repo.id === id ? { ...repo, [field]: value } : repo
      ) || null
    );
  };

  const handleRepoSelect = (id: number) => {
    const newSelectedRepos = new Set(selectedRepos);
    if (newSelectedRepos.has(id)) {
      newSelectedRepos.delete(id);
    } else {
      newSelectedRepos.add(id);
    }
    setSelectedRepos(newSelectedRepos);
  };

  const handleQueueSummary = (repoId: number) => {
    if (!summaryQueue.includes(repoId) && summarizingRepoId !== repoId) {
      setSummaryQueue(prevQueue => [...prevQueue, repoId]);
    }
  };

  const handleGeneratePortfolio = () => {
    if (selectedRepos.size === 0) {
      alert('저장소를 하나 이상 선택해주세요.');
      return;
    }
    const selectedRepoData = repos?.filter(repo => selectedRepos.has(repo.id));
    localStorage.setItem('portfolio_user', JSON.stringify(user));
    localStorage.setItem('portfolio_repos', JSON.stringify(selectedRepoData));

    router.push(`/portfolio/${selectedTemplate}`);
  };

  const filteredRepos = repos?.filter(repo => showForks || !repo.fork);

  if (loading || !user) {
    return <div className="text-center py-20">Loading user data...</div>; // Basic loading state
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">GitHub Repository Analysis</h1>
      
      <div className="space-y-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">저장소 불러오기</h2>
            <p className="text-gray-500 mt-1">포트폴리오에 포함할 저장소를 불러오세요.</p>
          </div>
          <div className="flex space-x-2 pt-4">
            <button onClick={fetchAffiliatedRepos} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400" disabled={repoLoading}>
              {repoLoading ? '불러오는 중...' : '소속된 저장소'}
            </button>
            <button onClick={fetchContributedRepos} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400" disabled={repoLoading}>
              {repoLoading ? '불러오는 중...' : '기여한 저장소'}
            </button>
          </div>
        </div>

        {repoLoading && <p className="text-center text-gray-500">저장소 목록을 불러오는 중...</p>}
        {repoError && <p className="text-center text-red-500">{repoError}</p>}
        
        {repos && (
          <div className="pt-4 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="text-2xl font-semibold">저장소 선택 및 편집</h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showForks} 
                  onChange={() => setShowForks(!showForks)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">포크된 저장소 보기</span>
              </label>
            </div>
            <div className="space-y-4 p-1">
              {filteredRepos && filteredRepos.map(repo => (
                <div key={repo.id} className={`p-5 rounded-lg transition-all border ${selectedRepos.has(repo.id) ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                       <input
                        type="checkbox"
                        checked={selectedRepos.has(repo.id)}
                        onChange={() => handleRepoSelect(repo.id)}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={repo.name}
                          onChange={(e) => handleRepoChange(repo.id, 'name', e.target.value)}
                          className="text-xl font-bold text-indigo-700 bg-transparent focus:outline-none w-full"
                        />
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-gray-600" title="Go to GitHub repository">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                      <span className="flex items-center text-sm text-gray-500">
                        <span className="mr-1">👥</span>
                        <span>{repo.contributor_count}</span>
                      </span>
                      <span className="flex items-center text-sm text-yellow-500">
                        <span className="mr-1">★</span>
                        <span>{repo.stargazers_count}</span>
                      </span>
                    </div>
                  </div>
                  
                  {repo.fork && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-8 mt-1 inline-block">포크</span>}
                  
                  <div className="pl-8 mt-2 space-y-3">
                    <textarea
                      value={repo.description || ''}
                      onChange={(e) => handleRepoChange(repo.id, 'description', e.target.value)}
                      className="text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="설명 없음"
                    />
                    <div className="flex justify-end">
                       <button 
                        onClick={() => handleQueueSummary(repo.id)}
                        disabled={summaryQueue.includes(repo.id) || summarizingRepoId === repo.id}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-lg disabled:bg-gray-400 transition-colors"
                      >
                        {
                          summarizingRepoId === repo.id 
                            ? '생성 중...' 
                            : summaryQueue.includes(repo.id) 
                                ? '대기 중...' 
                                : 'AI로 설명 생성'
                        }
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {repo.languages && Object.keys(repo.languages).length > 0 ? (
                          Object.keys(repo.languages).map(lang => (
                            <span key={lang} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">언어 정보 없음</span>
                        )}
                      </div>
                      <span className="flex-shrink-0">업데이트: {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {repos && (
          <div className="pt-12 mt-10 border-t">
            <h3 className="text-2xl font-semibold text-center">포트폴리오 생성</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="template-one">심플 포트폴리오</option>
                {/* Add other templates here in the future */}
              </select>
              <button
                onClick={handleGeneratePortfolio}
                disabled={selectedRepos.size === 0}
                className="w-full sm:w-auto px-6 py-2 text-center text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
              >
                {`포트폴리오 생성 (${selectedRepos.size}개 선택)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}