import React, { useState, useEffect, useMemo } from 'react';
// Aurora Template
import { 
  Github, 
  Book, 
  Mail, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description?: string;
  stargazers_count?: number;
  contributor_count?: number;
  languages?: Record<string, number>;
  updated_at?: string;
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
  title?: string;
  skills?: string[];
  careers?: any[];
}

interface Props { user: UserProfile | null; repos: Repo[] | null }

const defaultProfile = {
  name: "김유림",
  role: "웹 개발자 (FE)",
  email: "icho0405@gmail.com",
  github: "https://github.com/yurim45",
  blog: "https://velog.io/@april_5",
  slogan: "It is Impossible to\nImagine",
  subSlogan: "What is impossible.",
  intro: "함께 일 하고 싶은 개발자,\n사용자 관점에서 개발하는 프론트엔드 개발자"
};

const defaultSkills = {
  frontend: ["Next.js", "React", "Vue.js", "Angular", "TypeScript", "React Query", "Recoil", "Redux-toolkit", "Tailwind", "Styled-components"],
  basic: ["HTML5", "CSS3", "JavaScript"],
  tools: ["Notion", "Figma", "Zeplin"],
  vcs: ["Git", "GitHub", "GitLab"],
  mobile: ["React Native"],
  deployment: ["Vercel"]
};

const defaultCareer = [
  {
    company: "Thingsflow",
    period: "2023.10.19 ~ 현재",
    role: "웹/스튜디오 기능 개발 및 유지 보수",
    highlight: "헬로우봇 / 스토리플레이",
    skills: ["Next.js 14", "Angular 13", "TypeScript", "RxJS", "RestAPI", "SCSS", "Tailwind"],
    tasks: [
      "AI 반려동물 프로필 (https://hellomy.ai/) 개발",
      "Next.js 14 다국어 지원",
      "토스페이먼츠 연동 (국내/외)",
      "AI 궁합도 기능 개발",
      "구독 결제 개발",
      "Angular 9 -> 13 버전 업데이트",
      "마이크로 프론트엔드 적용"
    ]
  },
  {
    company: "At&P Partners",
    period: "2022.01.24 ~ 12.19",
    role: "차세대 프로그램 MVP 개발",
    highlight: "연말정산 솔루션",
    skills: ["Next.js", "React", "TypeScript", "React-Query", "Recoil", "Storybook", "Styled-Components"],
    tasks: [
      "MVP 개발 (사용자용)",
      "본인인증 웹뷰 API 구현",
      "글로벌 작업",
      "웹소설 epub file viewer 개발 및 웹뷰 연동",
      "Lighthouse를 활용한 성능 최적화",
      "Sentry 설정"
    ]
  }
];

const defaultProjects = [
  {
    title: "근태관리 프로그램",
    period: "2021-06-07 ~ 07-01",
    team: "FE: 2명, BE: 1명",
    desc: "근태 등록, 근무제 선택 및 신청, 연차 등 휴가 관리 등의 근태관리 프로그램 개발 프로젝트",
    features: [
      "사용자페이지, 마이페이지, 관리자페이지로 구성",
      "기본 근태 입력 및 조회",
      "휴가 신청 및 근무제 신청 및 조회",
      "근로시간 및 초과근무, 출•퇴근 시간 시각화",
      "출•퇴근 기록 조회 및 검색 기능"
    ],
    github: "github.com/yurim45/b2tech-intern-20-front",
    stack: ["React", "JavaScript", "Styled-Components", "HTML"]
  },
  {
    title: "Easy-Work App: 사내용 프로그램",
    period: "2022.08.09 ~ 10.11",
    team: "총 3명",
    desc: "Vue.js를 배우면서 PWA를 적용한 사내용 프로그램을 제작한 프로젝트",
    features: [
      "권한별 페이지 구성(사용자, 관리자)",
      "복지 포인트 기능",
      "휴가 등록 및 조회, 관리",
      "구매 요청 및 승인, 알림"
    ],
    github: "github.com/yurim45/easy-work-app",
    stack: ["Vue.js", "JavaScript", "Apollo GraphQL", "Sass"]
  }
];

export default function Aurora({ user: propUser, repos: propRepos }: Props) {
  const [activeId, setActiveId] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Merge props with defaults
  const profile = useMemo(() => {
    const u = propUser || ({} as any);
    return {
      name: u.name || defaultProfile.name,
      role: u.title || defaultProfile.role,
      email: u.email || defaultProfile.email,
      github: u.html_url || defaultProfile.github,
      blog: u.blog || defaultProfile.blog,
      slogan: u.title ? u.title.split('\n')[0] : defaultProfile.slogan,
      subSlogan: u.title && u.title.split('\n')[1] ? u.title.split('\n')[1] : defaultProfile.subSlogan,
      intro: u.bio || defaultProfile.intro,
      avatar: u.avatar_url
    };
  }, [propUser]);

  const skills = useMemo(() => {
    if (propUser?.skills && propUser.skills.length > 0) {
      return { "My Skills": propUser.skills };
    }
    return defaultSkills;
  }, [propUser]);

  const career = useMemo(() => {
    if (propUser?.careers && propUser.careers.length > 0) {
      return propUser.careers.map((c: any) => ({
        company: c.company,
        period: `${c.start} ~ ${c.end || '현재'}`,
        role: c.role,
        highlight: c.role, // fallback
        skills: [], // data structure mismatch handling
        tasks: c.description ? c.description.split('\n') : []
      }));
    }
    return defaultCareer;
  }, [propUser]);

  const projects = useMemo(() => {
    if (propRepos && propRepos.length > 0) {
      return propRepos.map(repo => ({
        title: repo.name,
        period: repo.updated_at ? new Date(repo.updated_at).getFullYear().toString() : '',
        team: "Personal",
        desc: repo.description || '',
        features: [],
        github: repo.html_url.replace('https://', ''),
        stack: repo.languages ? Object.keys(repo.languages) : []
      }));
    }
    return defaultProjects;
  }, [propRepos]);

  const archive = useMemo(() => [
    {
      title: "GitHub",
      url: profile.github.replace('https://', ''),
      link: profile.github,
      desc: "■ 프로젝트의 소스 코드가 있습니다.\n■ 코딩 연습을 위해 작업한 코드가 있습니다.",
      type: "github"
    },
    {
      title: "Blog",
      url: profile.blog.replace('https://', ''),
      link: profile.blog,
      desc: "■ 공부한 것을 정리할 목적의 블로그입니다.\n■ 개발하며 겪은 이야기를 공유합니다.",
      type: "blog"
    }
  ], [profile]);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'career', 'projects'];
      const scrollPos = window.scrollY + 100;
      
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el && el.offsetTop <= scrollPos && (el.offsetTop + el.offsetHeight) > scrollPos) {
          setActiveId(sec);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#333] font-sans selection:bg-pink-100 selection:text-pink-900">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-6 md:px-12 transition-colors duration-300 ${activeId === 'home' ? 'bg-transparent text-white' : 'bg-white/90 backdrop-blur-sm text-black border-b border-gray-100'}`}>
        <div 
          className={`font-bold text-lg cursor-pointer transition-colors ${activeId === 'home' ? 'text-white' : 'hover:text-pink-500'}`}
          onClick={() => scrollTo('home')}
        >
          {profile.name} Portfolio
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {['About', 'Skills', 'Career', 'Projects'].map(item => (
            <button 
              key={item}
              onClick={() => scrollTo(item.toLowerCase())}
              className={`transition-colors ${activeId === 'home' ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-black'} ${activeId === item.toLowerCase() ? 'font-bold' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 flex flex-col items-center gap-4 md:hidden text-black">
             {['About', 'Skills', 'Career', 'Projects'].map(item => (
              <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-gray-600 font-medium w-full py-2 hover:bg-gray-50"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main>
        
        {/* 1. Hero / Intro (Full Screen & Custom Color) */}
        <section 
          id="home" 
          className="relative h-screen w-full flex flex-col items-center justify-center text-center px-6 bg-[#fbb0a3]"
        >
          <div className="z-10">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white leading-tight drop-shadow-sm" style={{ fontFamily: 'serif' }}>
              {profile.slogan}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light mb-10 italic" style={{ fontFamily: 'serif' }}>
              {profile.subSlogan}
            </p>
            <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-8 py-3 rounded-full shadow-sm">
              <p className="text-lg font-medium text-white">
                웹 개발자 <span className="font-bold border-b border-white pb-0.5">{profile.name}</span>의 포트폴리오입니다!
              </p>
            </div>
            <div className="mt-8 text-sm text-white/70 underline decoration-white/50 underline-offset-4">
              {profile.blog}
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/80">
            <ChevronDown size={32} />
          </div>
        </section>

        {/* 2. About Me */}
        <section id="about" className="py-24 max-w-4xl mx-auto px-6">
          <SectionTitle title="About Me" />
          
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            {/* Profile Image */}
            <div className="w-48 h-48 shrink-0 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">Profile IMG</div>
              )}
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.name} <span className="text-base font-normal text-gray-500">| {profile.role}</span>
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {profile.intro}
                </p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2 inline-block">Contact</h4>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Archive Cards */}
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-l-4 border-[#fbb0a3] pl-3">Archive</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {archive.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {item.type === 'github' ? <Github size={28} className="text-gray-900" /> : <Book size={28} className="text-green-600" />}
                    <span className="text-xl font-bold">{item.title}</span>
                  </div>
                  <div className="text-sm text-blue-500 mb-4 font-medium">{item.url}</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {item.desc.split('\n').map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {line}
                      </li>
                    ))}
                  </ul>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Skills */}
        <section id="skills" className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <SectionTitle title="Skills" />
            <p className="text-gray-500 mb-10">현재까지 배우고 사용 해봤던 기술입니다</p>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="space-y-8">
                {Object.entries(skills).map(([category, items], index) => (
                  <div key={category} className={`flex flex-col sm:flex-row sm:gap-8 ${index !== Object.keys(skills).length - 1 ? 'border-b border-gray-100 pb-8' : ''}`}>
                     <h3 className="w-32 shrink-0 text-lg font-bold capitalize mb-4 sm:mb-0 text-[#fbb0a3] flex items-center">
                       {category}
                     </h3>
                     <div className="flex-1 flex flex-wrap gap-2">
                       {items.map(skill => (
                         <span key={skill} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#fbb0a3]/10 hover:border-[#fbb0a3] hover:text-[#e08c7d] transition-colors cursor-default">
                           {skill}
                         </span>
                       ))}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Career */}
        <section id="career" className="py-24 max-w-4xl mx-auto px-6">
          <SectionTitle title="Career" />
          
          <div className="space-y-16">
            {career.map((job, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 md:gap-12 border-l-2 border-gray-100 pl-6 md:pl-0 md:border-none">
                
                {/* Left: Company Info */}
                <div className="md:w-1/3 shrink-0">
                  <div className="sticky top-24">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200">
                      LOGO
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.company}</h3>
                    <p className="text-sm text-gray-400 font-medium mb-4">{job.period}</p>
                    <div className="text-sm text-gray-600 font-medium bg-gray-50 px-3 py-2 rounded-lg inline-block border border-gray-100">
                      {job.highlight}
                    </div>
                  </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-gray-800">{job.role}</h4>
                  
                  <div className="mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h5 className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">✔️ 담당 역할</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {job.tasks.map((task: string, tIdx: number) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-[#fbb0a3] rounded-sm shrink-0"></span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Projects */}
        <section id="projects" className="py-24 bg-gray-900 text-white">
           <div className="max-w-4xl mx-auto px-6">
             <div className="flex items-center gap-4 mb-12">
               <h2 className="text-4xl font-black tracking-tighter text-white">Projects</h2>
               <div className="flex-1 h-px bg-gray-700"></div>
             </div>

             <div className="grid gap-12">
               {projects.map((proj, idx) => (
                 <article key={idx} className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-colors border border-gray-700">
                   <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                     <div>
                       <h3 className="text-2xl font-bold mb-2">{proj.title}</h3>
                       <p className="text-gray-400 text-sm">{proj.period} | {proj.team}</p>
                     </div>
                     <div className="flex gap-3">
                       <a href={`https://${proj.github}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition">
                         GitHub
                       </a>
                     </div>
                   </div>

                   <p className="text-gray-300 mb-6 leading-relaxed">
                     {proj.desc}
                   </p>

                   <div className="mb-6">
                     <h4 className="font-bold text-[#fbb0a3] mb-3 text-sm uppercase tracking-wider">주요 기능</h4>
                     <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                       {proj.features.map((feat: string, i: number) => (
                         <li key={i} className="flex items-center gap-2">
                           <span className="w-1 h-1 bg-[#fbb0a3] rounded-full"></span>
                           {feat}
                         </li>
                       ))}
                     </ul>
                   </div>

                   <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-700">
                     {proj.stack.map((tech: string) => (
                       <span key={tech} className="px-3 py-1 bg-gray-900 text-gray-300 text-xs rounded-full border border-gray-600">
                         {tech}
                       </span>
                     ))}
                   </div>
                 </article>
               ))}
             </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-sm text-gray-400 border-t border-gray-100">
          Copyright ⓒ 2024. {profile.name} All rights reserved.
        </footer>

      </main>
    </div>
  );
}

/**
 * Helper Components
 */
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{title}</h2>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}