import React, { useMemo, useState, useEffect } from 'react';

// NOTE: 외부 사이트(meganmagic)의 디자인 시스템(색상, 폰트, 레이아웃)을
// Tailwind CSS로 재구성하여 원본과 매우 유사한 시각적 결과물을 목표로 합니다.
// 사용자는 자신의 데이터(user, repos)를 주입해 실제 콘텐츠를 채웁니다.

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description?: string;
  stargazers_count?: number;
  contributor_count?: number;
  languages?: Record<string, number>;
  updated_at?: string;
  created_at?: string;
  period?: string;
}

interface UserProfile {
  login: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  email?: string;
  skills?: string[];
  blogPosts?: { id: number; title: string; date: string; url: string; }[];
}

interface Props { user: UserProfile | null; repos: Repo[] | null }

// --- START: Example Data based on meganmagic.com ---
// Prefer local assets under `/public/templates/meganmagic` if available.
const ASSET_BASE = '/templates/meganmagic';

const defaultSkills = [
  'Javascript', 'React.js', 'Next.js', 'typescript', 'Zustand', 'Styled-components', 'tailwind css', 'Antd', 'Chakra-UI', 'Jest', 'React-testing-library', 'Storybook', 'GraphQL', 'Tanstack-query', 'React-hook-form', 'Redux', 'Sass', 'Webpack', 'pnpm workspace', 'Vercel', 'AWS Amplify', 'Github', 'Vite', 'Figma',
];

const defaultProfile = {
  name: '송진경',
  bio: 'React를 중심으로 웹 프론트엔드를 개발합니다. 함께 제품을 만들고 성장시킬 곳을 찾고 있습니다.',
  email: 'sjk.mari@gmail.com',
  phone: '010-3215-4462',
  githubUrl: 'https://github.com/MeganMagic',
  blogUrl: 'https://velog.io/@mari',
  resumeUrl: 'https://lh8zlkkhlslw0zyz.public.blob.vercel-storage.com/resume_20240815-KP7ogJVwF1jkbKglxaTbxv7NtrC7yw.pdf?download=1',
  // Local-first avatar: place `profile.png` in `public/templates/meganmagic/profile.png` to override remote
  avatarUrl: `${ASSET_BASE}/profile.png`,
  skills: defaultSkills,
};

const defaultCareers = [
    { id: 1, company: '비상교육', role: '글로벌 Company, 소프트웨어개발 Cell', start: '2024', end: '현재', description: '온라인 교육 플랫폼 백오피스 개발 및 유지보수, 글로벌 서비스 FE 개발' },
    { id: 2, company: '코드스테이츠', role: 'Internal System Product팀, Frontend-Engineer', start: '2022', end: '2023', description: '수강생 관리 시스템(LMS) 개발 및 유지보수, 코드스테이츠 공식 홈페이지 리뉴얼 및 성능 최적화' },
    { id: 3, company: '스탠다드 로봇', role: '홈페이지 제작 외주', start: '2021.09', end: '2021.11', description: 'UI/UX 디자인 및 프론트엔드 개발' },
];

const defaultProjects: Omit<Repo, 'contributor_count' | 'updated_at'>[] = [
    { id: 1, name: '티끌', description: '가계부 공유 플랫폼 개발 프로젝트', html_url: 'https://github.com/MeganMagic/tiggle', stargazers_count: 15, languages: { 'React.js': 1, 'typescript': 1, 'Vite': 1 } },
    { id: 2, name: '개인 포트폴리오', description: 'Next.js App router를 활용하여 제작한 포트폴리오 사이트', html_url: 'https://github.com/MeganMagic/portfolio-v2', stargazers_count: 12, languages: { 'Next.js': 1, 'typescript': 1, 'tailwind css': 1 } },
    { id: 3, name: '코드스테이츠 홈페이지', description: 'Next.js 기반 웹사이트 개발 및 유지보수, 성능 최적화', html_url: '#', stargazers_count: 8, languages: { 'Next.js': 1, 'React.js': 1, 'typescript': 1 } },
    { id: 4, name: 'Toast 컴포넌트', description: '코드스테이츠 디자인 시스템 프로젝트 참여, 공용 컴포넌트 개발', html_url: '#', stargazers_count: 5, languages: { 'React.js': 1, 'Storybook': 1, 'Zustand': 1 } },
    { id: 5, name: 'Touch Art Archive', description: '맹학교 미술 수업용 회화 작품 3D 프린팅 파일 아카이빙 프로젝트', html_url: 'https://github.com/touch-art-archive/archive-web', stargazers_count: 3, languages: { 'React.js': 1, 'Redux': 1, 'AWS Amplify': 1 } },
    { id: 6, name: 'Art & Tech Conference', description: '서강대학교 A&T 전공 연간 학생 전시 웹사이트', html_url: 'https://github.com/Sogang-Art-Technology/at-conference-2020', stargazers_count: 2, languages: { 'React.js': 1, 'Javascript': 1 } },
];

const defaultBlogPosts = [
    { id: 1, title: '[TypeScript] openapi codegen에서 optional 삭제하기', date: '2024.01.10', url: 'https://velog.io/@mari/remove-optional-in-openapi-typescript-codegen' },
    { id: 2, title: '[Ant Design] token을 이용하여 컴포넌트 padding을 변경하기', date: '2023.11.06', url: 'https://velog.io/@mari/Ant-Design-padding-custom-by-token' },
    { id: 3, title: 'msw 에러 해결 "TypeError: Failed to execute \'text\' on \'Response\'..."', date: '2023.07.25', url: 'https://velog.io/@mari/msw-%EC%97%90%EB%9F%AC-%ED%95%B4%EA%B2%B0-TypeError-Failed-to-execute-text-on-Response-body-stream-already-read' },
];
// --- END: Example Data ---

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch (e) {
    return '';
  }
};

export default function MeganMagic({ user: propUser, repos: propRepos }: Props) {
  // Combine prop data with default data
  const user = useMemo(() => ({ ...defaultProfile, ...propUser }), [propUser]);
  const repos = useMemo(() => (propRepos && propRepos.length > 0) ? propRepos : defaultProjects, [propRepos]);
  const careers = useMemo(() => {
      const fromStorage = JSON.parse(localStorage.getItem('portfolio_profile') || '{}').careers;
      return (fromStorage && fromStorage.length > 0) ? fromStorage : defaultCareers;
  }, []);
  const blogPosts = useMemo(() => {
      if (user.blogPosts && user.blogPosts.length > 0) return user.blogPosts;
      return defaultBlogPosts;
  }, [user.blogPosts]);


  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll(); // Initial check
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // LocalStorage data is now handled by the useMemo initializers above
  // This useEffect can be removed or simplified if only used for other things.
  // For now, we'll keep it empty to avoid breaking other logic.
  useEffect(() => {
    // This effect can be used for other client-side logic if needed.
  }, []);

  // avatar src with fallback handling for missing local `profile.png`
  const [avatarSrc, setAvatarSrc] = useState<string>(user.avatarUrl || defaultProfile.avatarUrl);
  useEffect(() => {
    setAvatarSrc(user.avatarUrl || defaultProfile.avatarUrl);
  }, [user.avatarUrl]);

  const [active, setActive] = useState<string>('hero');
  useEffect(() => {
    const ids = ['hero', 'career', 'tech', 'featured', 'blog', 'contact'];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(id);
          });
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [repos]);

  const topLanguages = useMemo(() => {
    return user.skills || [];
  }, [user.skills]);

  const projectShowcase = useMemo(() => {
    if (!repos) return [];
    return [...repos]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6);
  }, [repos]);

  const navLinkClasses = (id: string) =>
    `transition-colors duration-200 ${active === id ? 'text-mm-accent font-semibold' : 'text-mm-sub hover:text-mm-text'}`;

  return (
    <div className="bg-mm-bg text-mm-text font-sans scroll-smooth">
      {/* TOP NAV */}
      <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md bg-white/80 backdrop-blur-sm' : 'bg-mm-bg'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#hero" className="text-xl font-bold tracking-tight text-mm-text">
            {user.name}
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#hero" className={navLinkClasses('hero')}>Home</a>
            <a href="#career" className={navLinkClasses('career')}>Career</a>
            <a href="#tech" className={navLinkClasses('tech')}>Skills</a>
            <a href="#featured" className={navLinkClasses('featured')}>Projects</a>
            <a href="#blog" className={navLinkClasses('blog')}>Blog</a>
            <a href="#contact" className={navLinkClasses('contact')}>Contact</a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section id="hero" className="relative py-28 md:py-40">
          {/* Decorative shape SVGs removed */}
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-mm-text mb-4">
                안녕하세요,
                <br />
                프론트엔드 개발자
                <br />
                <span className="text-mm-accent">{user.name}</span>입니다.
              </h1>
              <p className="mt-6 text-base md:text-lg leading-relaxed text-mm-sub max-w-xl">
                {user.bio}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {user.resumeUrl && (
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold bg-mm-accent text-white shadow-lg shadow-mm-accent/20 hover:bg-mm-accent-hover transition-all transform hover:-translate-y-0.5"
                  >
                    이력서 다운로드
                  </a>
                )}
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold bg-gray-800 text-white shadow-lg shadow-gray-800/20 hover:bg-gray-900 transition-all transform hover:-translate-y-0.5"
                  >
                    GitHub 프로필
                  </a>
                )}
              </div>
            </div>
            <div className="relative flex justify-center items-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-8 border-white">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = `${ASSET_BASE}/image.png`; }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-6xl font-bold text-gray-500">?</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CAREER / TIMELINE */}
        <section id="career" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold mb-16 text-center">경력 사항</h2>
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute left-1/2 top-2 bottom-0 w-0.5 bg-mm-border -translate-x-1/2" />
              <div className="space-y-16">
                {careers.map((c: any, idx: number) => (
                  <div key={String(c.id || idx)} className="relative flex items-start group">
                     <div className="absolute left-1/2 -translate-x-1/2 top-1 w-4 h-4 rounded-full bg-white border-2 border-mm-accent ring-4 ring-white transition-all group-hover:scale-125" />
                    <div className={`w-1/2 pr-8 text-right ${idx % 2 === 1 ? 'order-2 pl-8 pr-0 text-left' : ''}`}>
                      <p className="text-sm text-mm-sub font-medium">
                        {(c.start || '').toString()} {c.end ? ` - ${c.end}` : ''}
                      </p>
                      <h3 className="text-xl font-bold mt-1 text-mm-text">{c.company || '회사명'}</h3>
                      <p className="text-base text-mm-sub mt-1">{c.role || '직책'}</p>
                    </div>
                     <div className={`w-1/2 pl-8 ${idx % 2 === 1 ? 'order-1 pr-8 pl-0 text-right' : ''}`}>
                      <p className="text-base text-mm-sub whitespace-pre-line leading-relaxed">{c.description || '주요 업무 내용이 없습니다.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LANG / SKILLS STRIP */}
        <section id="tech" className="py-24 bg-mm-bg">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold mb-12 text-center">기술 스택 및 도구</h2>
            <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
              {topLanguages.map((lang) => (
                <div key={lang} className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-mm-border hover:shadow-md transition-shadow">
                  <span className="text-base font-bold text-mm-text">{lang}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS GRID */}
        <section id="featured" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold mb-12 text-center">주요 프로젝트</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectShowcase.map((repo, idx) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-mm-border bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* optional top image: if you place `feature1.png`, `feature2.png`, ... under `public/templates/meganmagic/` they will be used */}
                  <div className="overflow-hidden rounded-t-xl">
                    <img
                      src={`${ASSET_BASE}/feature${repo.id}.png`}
                      alt={repo.name}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = `${ASSET_BASE}/feature${(idx % 3) + 1}.png`; }}
                      className="w-full h-40 object-cover bg-gray-100"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-mm-text group-hover:text-mm-accent transition-colors">
                        {repo.name}
                      </h3>
                      {typeof repo.stargazers_count === 'number' && repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          {repo.stargazers_count}
                        </span>
                      )}
                    </div>
                    <div className="mb-2 text-xs text-mm-sub font-medium">
                      {repo.period ? (
                        <span>{repo.period}</span>
                      ) : (repo.created_at && repo.updated_at ? (
                        <span>{formatDate(repo.created_at)} - {formatDate(repo.updated_at)}</span>
                      ) : (
                        repo.updated_at && <span>~ {formatDate(repo.updated_at)}</span>
                      ))}
                    </div>
                    <p className="text-base text-mm-sub line-clamp-3 leading-relaxed whitespace-pre-line">
                      {repo.description || '설명이 없습니다.'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {repo.languages && Object.keys(repo.languages).slice(0, 4).map(l => (
                        <span key={l} className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ALL PROJECT LIST (optional extended) */}
        {repos && repos.length > 6 && (
          <section id="more" className="py-24 bg-mm-bg">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl font-extrabold mb-12 text-center">더 많은 프로젝트</h2>
              <div className="max-w-4xl mx-auto space-y-4">
                {repos.slice(6).map(r => (
                  <a
                    key={r.id}
                    href={r.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-mm-border rounded-lg p-5 hover:shadow-md transition-shadow bg-white hover:border-mm-accent"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-mm-accent">{r.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-mm-sub">
                        {typeof r.stargazers_count === 'number' && <span className="flex items-center gap-1">★ {r.stargazers_count}</span>}
                        {(r.period || r.created_at || r.updated_at) && (
                          <span>
                            {r.period ? r.period : (
                              <>
                                {r.created_at ? formatDate(r.created_at) : ''} 
                                {r.created_at && r.updated_at ? ' - ' : ''} 
                                {r.updated_at ? formatDate(r.updated_at) : ''}
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-mm-sub mt-2 whitespace-pre-line">{r.description || '설명이 없습니다.'}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BLOG */}
        <section id="blog" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center">
                  <h2 className="text-3xl font-extrabold mb-4">블로그</h2>
                  <p className="text-lg text-mm-sub max-w-2xl mx-auto mb-8">자세한 문제해결 과정과 기술 기록은 블로그에서 확인할 수 있습니다.</p>
              </div>
              <div className="max-w-3xl mx-auto space-y-6">
                  {blogPosts.map(post => (
                      <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="block p-6 border border-mm-border rounded-lg hover:shadow-lg hover:border-mm-accent transition-all">
                          <p className="text-sm text-mm-sub">{post.date}</p>
                          <h4 className="text-lg font-bold text-mm-text mt-2 group-hover:text-mm-accent">{post.title}</h4>
                      </a>
                  ))}
              </div>
              <div className="text-center mt-12">
                <a href={user.blogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold bg-mm-accent text-white shadow-lg shadow-mm-accent/20 hover:bg-mm-accent-hover transition-all transform hover:-translate-y-0.5">
                  블로그로 이동
                </a>
              </div>
            </div>
        </section>
      </main>

      {/* CONTACT / FOOTER */}
      <footer id="contact" className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold">감사합니다</h2>
          <p className="mt-4 text-lg text-gray-300">더 궁금한 점이 있다면 편하게 연락주세요.</p>
          <div className="mt-8 flex justify-center items-center flex-wrap gap-x-8 gap-y-4">
            <a href={`mailto:${user.email}`} className="font-semibold hover:text-mm-accent transition-colors">{user.email}</a>
            <span className="font-semibold">{user.phone}</span>
            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-mm-accent transition-colors">GitHub</a>
          </div>
        </div>
        <div className="border-t border-gray-700 py-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {user.name}. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
