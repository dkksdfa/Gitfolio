'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const template = params.template as string;

  const [TemplateComponent, setTemplateComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!template) return;
    // Dynamic import relative to this file
    import(`../../../templates/${template}.tsx`)
      .then(mod => setTemplateComponent(() => mod.default))
      .catch(() => setError('템플릿을 불러오지 못했습니다.'));
  }, [template]);

  // download removed per UX change request

  // Load profile and projects from localStorage if available
  const [userData, setUserData] = useState<any>({ login: 'example', name: 'Example User', avatar_url: '', html_url: '#' });
  const [reposData, setReposData] = useState<any[]>([
    { id: 1, name: 'demo-repo', description: 'Demo repo', html_url: '#', languages: { TS: 100 }, stargazers_count: 3, contributor_count: 1, updated_at: new Date().toISOString() },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portfolio_profile');
      if (raw) {
        const obj = JSON.parse(raw);
        setUserData({ login: obj.github || 'example', name: obj.name || obj.title || 'Example User', avatar_url: '', html_url: obj.github || '#' });
        if (Array.isArray(obj.projects) && obj.projects.length > 0) {
          const mapped = obj.projects.map((p: any, i: number) => ({ id: p.id ?? `proj-${i}`, name: p.name || '', description: p.description || '', html_url: p.url || '#', languages: {}, stargazers_count: 0, contributor_count: 0, updated_at: new Date().toISOString() }));
          setReposData(mapped);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">템플릿 미리보기</h1>
        <div className="space-x-2">
          <button onClick={() => router.back()} className="px-3 py-2 border rounded">뒤로</button>
          <button
            onClick={() => {
              try {
                localStorage.setItem('selected_template', template);
              } catch (e) { }
              router.push('/analysis');
            }}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            이 템플릿 선택
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 max-w-7xl mx-auto px-6">{error}</div>}

      <div ref={previewRef} className="w-full min-h-[80vh] bg-white">
        {TemplateComponent ? (
          // Render the template component in preview mode - full width
          <div className="w-full h-full">
            <TemplateComponent user={userData} repos={reposData} />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">템플릿을 불러오는 중...</div>
        )}
      </div>
    </div>
  );
}
