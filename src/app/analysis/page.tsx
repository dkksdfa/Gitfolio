'use client';

import PortfolioForm from '@/components/PortfolioForm';

export default function AnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">포트폴리오 생성</h1>
      <p className="text-center text-gray-500 mb-8">아래 양식을 작성하여 포트폴리오를 생성하세요.</p>
      <PortfolioForm />
    </div>
  );
}