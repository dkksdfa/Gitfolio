'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-8 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Gitfolio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
