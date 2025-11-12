'use client';

import PortfolioForm from '@/components/PortfolioForm';

export default function CreatePortfolioPage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">포트폴리오 생성 / 편집</h1>
            <PortfolioForm />
        </div>
    );
}
