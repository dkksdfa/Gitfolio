'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // /portfolio/ 로 시작하는 경로(결과 페이지)와 /templates/ 로 시작하는 경로(템플릿 미리보기)에서는 헤더/푸터를 숨김
    // 단, /templates 목록 페이지는 제외하기 위해 /templates/ 뒤에 무언가 더 있어야 함을 체크하거나 startsWith('/templates/') 사용 (목록이 /templates 라면 /templates/는 매칭 안됨)
    const isPortfolioPreview = pathname?.startsWith('/portfolio/') || pathname?.startsWith('/templates/');

    return (
        <div className="flex flex-col min-h-screen">
            {!isPortfolioPreview && <Header />}
            <main className={isPortfolioPreview ? "" : "flex-grow"}>
                {children}
            </main>
            {!isPortfolioPreview && <Footer />}
        </div>
    );
}
