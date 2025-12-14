import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
  title: 'Gitfolio - AI-Powered Portfolio Builder',
  description: 'Turn your GitHub projects into a stunning portfolio with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.className} ${notoSansKr.variable} bg-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
