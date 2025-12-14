'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const TEMPLATES: Record<string, any> = {
  cdg: dynamic(() => import('../../../templates/cdg')),
  meganmagic: dynamic(() => import('../../../templates/meganmagic')),
  modern: dynamic(() => import('../../../templates/modern')),
  aurora: dynamic(() => import('../../../templates/aurora')),
};

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const template = params.template as string;

  const TemplateComponent = TEMPLATES[template];
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template && !TEMPLATES[template]) {
      setError('존재하지 않는 템플릿입니다.');
    }
  }, [template]);

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
          onClick={() => {
            try {
              localStorage.setItem('selected_template', template);
            } catch (e) { }
            router.push('/analysis');
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all text-sm"
        >
          이 템플릿 선택
        </button>
      </div>

      {error && <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-red-100 text-red-500 px-6 py-3 rounded-full shadow-lg">{error}</div>}

      <div className="w-full min-h-screen bg-white">
        {TemplateComponent ? (
          <TemplateComponent user={null} repos={null} />
        ) : (
          <div className="flex items-center justify-center min-h-screen text-gray-500">
            {error ? '템플릿을 불러올 수 없습니다.' : '템플릿을 불러오는 중...'}
          </div>
        )}
      </div>
    </div>
  );
}
