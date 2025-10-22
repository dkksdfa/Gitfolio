'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface User {
  login: string;
  name: string;
  avatar_url: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="w-full px-4 sm:px-8 lg:px-16 py-4 flex justify-between items-center border-b bg-white">
      <Link href="/" legacyBehavior>
        <a className="text-2xl font-bold text-gray-900">Gitfolio</a>
      </Link>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/analysis" legacyBehavior>
              <a className="flex items-center gap-2">
                <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-semibold text-gray-700">{user.name || user.login}</span>
              </a>
            </Link>
            <a href="/api/auth/logout" className="text-sm font-semibold text-gray-500 hover:text-gray-800">
              로그아웃
            </a>
          </div>
        ) : (
          <Link href="/api/auth/github" legacyBehavior>
            <a className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>로그인</span>
            </a>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
