const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pretendard)', ...fontFamily.sans],
      },
      colors: {
        'mm-bg': '#F9FAFB',
        'mm-text': '#111827',
        'mm-sub': '#6B7280',
        'mm-accent': '#5865F2',
        'mm-accent-hover': '#4752C4',
        'mm-border': '#E5E7EB',
      },
    },
  },
  plugins: [],
};