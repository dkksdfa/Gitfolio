'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await axios.get('/api/user');
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleStartClick = () => {
    if (isLoggedIn) {
      router.push('/templates');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginConfirm = () => {
    router.push('/api/auth/github');
    setShowLoginModal(false);
  };

  return (
    <>
      {/* Hero Section with Background */}
      <section
        className="w-full h-[550px] flex flex-col justify-center text-white relative"
        style={{ backgroundImage: 'linear-gradient(to right, rgba(76, 29, 149, 0.8), rgba(59, 130, 246, 0.8))', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="md:w-10/12 text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              AI로 만드는 당신의 개발자 포트폴리오
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              AI가 깃허브 저장소를 분석하여 몇 분 만에 인상적인 포트폴리오를 만들어 드립니다.
            </p>
            <button
              onClick={handleStartClick}
              className="inline-block px-8 py-4 text-lg font-bold text-white bg-purple-700 rounded-lg hover:bg-purple-800 shadow-lg transition-transform transform hover:scale-105"
            >
              지금 바로 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. 깃허브 연결</h3>
              <p className="text-gray-600">깃허브 계정으로 로그인하여 안전하게 저장소 데이터를 가져오세요.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. AI 자동 요약</h3>
              <p className="text-gray-600">AI가 프로젝트의 내용과 나의 역할을 분석하여 매력적인 설명과 요약을 생성합니다.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. 템플릿 선택</h3>
              <p className="text-gray-600">전문적으로 디자인된 템플릿을 선택하고 새로운 포트폴리오가 즉시 살아나는 것을 확인하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">로그인 필요</h3>
            <p className="text-gray-600 mb-6">이 서비스는 로그인이 필요합니다. GitHub 계정으로 로그인하시겠습니까?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                아니요
              </button>
              <button
                onClick={handleLoginConfirm}
                className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}