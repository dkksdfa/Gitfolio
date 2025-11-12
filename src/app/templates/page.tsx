'use client';

import Link from 'next/link';
import { allTemplates } from '@/lib/templates';

export default function TemplatesListPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
      <h1 className="text-4xl font-bold mb-6">템플릿 목록</h1>
      <p className="text-gray-600 mb-8">미리보기 이미지로 디자인을 빠르게 확인하세요.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTemplates.map(t => (
          <Link key={t.id} href={`/templates/${t.id}`} className="block group">
            <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg bg-white">
              <div
                className="h-44 bg-gray-100 flex items-center justify-center"
                style={{ backgroundImage: `url('${t.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                aria-hidden
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1 group-hover:text-indigo-600">{t.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{t.description}</p>
                {/* Card is clickable; no separate preview button needed */}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
