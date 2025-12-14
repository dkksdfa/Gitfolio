import React, { useMemo } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  Github, 
  Globe, 
  Link as LinkIcon, 
  ChevronRight,
  Briefcase,
  Code2,
  Database,
  Layout,
  Cloud,
  Server
} from 'lucide-react';

/**
 * [데이터 설정]
 */
const DEFAULT_USER = {
  name: '홍길동',
  intro: '안녕하세요.\n본질에 집중하는 프론트엔드 개발자\n홍길동입니다.',
  birthdate: '98.01.01',
  location: '서울특별시',
  phone: '010-1234-5678',
  email: 'dev.hong@example.com',
  education: 'OO대학교 (컴퓨터공학부)',
  githubUrl: 'https://github.com',
  website: 'https://blog.example.com',
};

/**
 * [스킬 데이터]
 */
const SKILLS = [
  {
    category: "Language",
    icon: <Code2 className="w-5 h-5" />,
    items: ["TypeScript", "JavaScript", "Python", "Java", "Kotlin"]
  },
  {
    category: "Frontend",
    icon: <Layout className="w-5 h-5" />,
    items: ["Next.js", "React", "Zustand", "Recoil", "React-Query", "Tailwind CSS", "Emotion", "Vite"]
  },
  {
    category: "Backend",
    icon: <Server className="w-5 h-5" />,
    items: ["Django", "Spring Boot", "Gradle", "Firebase", "Supabase"]
  },
  {
    category: "DevOps",
    icon: <Cloud className="w-5 h-5" />,
    items: ["Docker", "AWS", "Kubernetes", "Redis", "Vercel"]
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 1,
    name: "포트폴리오 웹사이트 클론",
    period: "2024.01 - 2024.02",
    description: "기존 포트폴리오 사이트의 디자인 시스템을 분석하여 React와 Tailwind CSS로 재구현했습니다. 커스텀 클래스를 제거하고 표준 유틸리티 클래스로 변환하여 범용성을 높였습니다.",
    techs: ["React", "TypeScript", "Tailwind CSS"],
    repoUrl: "#",
    bullets: [
      "커스텀 Tailwind 설정 없이 실행 가능한 구조로 리팩토링",
      "Lucide React 아이콘을 활용하여 이미지 의존성 제거",
      "반응형 레이아웃 및 다크모드 대응"
    ]
  },
  {
    id: 2,
    name: "사내 업무 자동화 툴",
    period: "2023.08 - 2023.12",
    description: "반복적인 엑셀 작업을 자동화하여 팀의 업무 효율을 300% 증대시켰습니다.",
    techs: ["Python", "Selenium", "Pandas"],
    repoUrl: "#",
    bullets: [
      "데이터 크롤링 및 전처리 파이프라인 구축",
      "비개발자 동료를 위한 GUI 프로그램 배포 (PyQt)"
    ]
  }
];

const CAREER = [
  {
    name: '(주) 테크 스타트업',
    period: '2024.03 - (재직 중)',
    description: '글로벌 SaaS 서비스를 개발하고 운영합니다.',
    roles: ['Frontend 리드', '디자인 시스템 구축'],
    logoBg: 'bg-blue-50',
    isCurrent: true
  },
  {
    name: '(주) 웹 에이전시',
    period: '2022.06 - 2023.12',
    description: '다양한 클라이언트의 웹사이트를 구축했습니다.',
    roles: ['반응형 웹 퍼블리싱', 'React 마이그레이션'],
    logoBg: 'bg-orange-50',
    isCurrent: false
  }
];

const ARCHIVING = [
  {
    type: 'github',
    url: 'https://github.com',
    title: 'GitHub',
    desc: '소스 코드 저장소 · 공개 레포지토리'
  },
  {
    type: 'blog',
    url: 'https://blog.example.com',
    title: 'Tech Blog',
    desc: '공부, 에세이, 지식 공유'
  }
];

export default function CDG({ user: propUser, repos: propRepos }: { user: any, repos: any }) {
  // Data Mapping
  const USER = useMemo(() => ({
    ...DEFAULT_USER,
    ...propUser,
    name: propUser?.name || DEFAULT_USER.name,
    // Use bio directly if available, otherwise fallback to default intro
    intro: propUser?.bio || DEFAULT_USER.intro,
    title: propUser?.title || '',
    birthdate: propUser?.birthdate || DEFAULT_USER.birthdate,
    location: propUser?.location || DEFAULT_USER.location,
    phone: propUser?.phone || DEFAULT_USER.phone,
    email: propUser?.email || DEFAULT_USER.email,
    education: propUser?.education || DEFAULT_USER.education,
    githubUrl: propUser?.html_url || DEFAULT_USER.githubUrl,
    website: propUser?.blog || DEFAULT_USER.website,
  }), [propUser]);

  const PROJECTS = useMemo(() => {
    if (propRepos && propRepos.length > 0) {
      return propRepos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        period: repo.updated_at ? repo.updated_at.split('T')[0] : '',
        description: repo.description || '',
        techs: repo.language ? [repo.language] : [],
        repoUrl: repo.html_url,
        bullets: [] 
      }));
    }
    return DEFAULT_PROJECTS;
  }, [propRepos]);

  const SKILLS_DATA = useMemo(() => {
    if (propUser?.skills && propUser.skills.length > 0) {
      // Group skills by category (format: "Category:SkillName")
      const grouped: Record<string, string[]> = {};
      const uncategorized: string[] = [];

      propUser.skills.forEach((s: string) => {
        if (s.includes(':')) {
          const [cat, name] = s.split(':');
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(name);
        } else {
          uncategorized.push(s);
        }
      });

      if (uncategorized.length > 0) {
        grouped['Etc'] = uncategorized;
      }

      // Map to display format
      return Object.entries(grouped).map(([cat, items]) => {
        let icon = <Code2 className="w-5 h-5" />;
        if (cat === 'Frontend') icon = <Layout className="w-5 h-5" />;
        if (cat === 'Backend') icon = <Server className="w-5 h-5" />;
        if (cat === 'DevOps') icon = <Cloud className="w-5 h-5" />;
        if (cat === 'Tools') icon = <Database className="w-5 h-5" />;

        return {
          category: cat,
          icon,
          items
        };
      });
    }
    return SKILLS;
  }, [propUser]);

  const CAREER_DATA = useMemo(() => {
    if (propUser?.careers && propUser.careers.length > 0) {
      return propUser.careers.map((c: any) => ({
        name: c.company,
        period: `${c.start} - ${c.end}`,
        description: c.description,
        roles: [c.role],
        logoBg: 'bg-gray-50',
        isCurrent: c.end === '현재' || c.end === ''
      }));
    }
    return CAREER;
  }, [propUser]);

  const archivingList = useMemo(() => ARCHIVING.map(item => {
    if (item.type === 'github') return { ...item, url: USER.githubUrl };
    if (item.type === 'blog') return { ...item, url: USER.website };
    return item;
  }), [USER]);

  return (
    <div className="min-h-screen font-sans bg-white text-[#222] selection:bg-[#f9c51d] selection:text-black">
      
      {/* 1. Header */}
      <header className="py-6 md:py-9 bg-white/80 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tighter cursor-pointer hover:text-gray-600 transition-colors">
            {USER.name}'s Portfolio
          </h1>
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-bold text-gray-500">
            {['About me', 'Skills', 'Archiving', 'Projects', 'Career'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="hover:text-[#dcb228] hover:bg-black px-3 py-1 rounded transition-all"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* 2. Intro */}
        <section 
          className="py-24 md:py-32 bg-cover bg-center bg-no-repeat"
          style={{
            background: `linear-gradient(180deg, rgba(112, 93, 80, .8) 0, rgba(112, 93, 80, .8) 90%), url('/templates/cdg/masthead.jpg') 50% no-repeat`,
            backgroundSize: 'cover'
          }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 select-none text-white">
                <span className="mx-3 text-white/60 text-3xl align-middle">-</span>
                {USER.name}
                <span className="mx-3 text-white/60 text-3xl align-middle">-</span>
              </h2>
              
              {USER.title && (
                <div className="text-xl md:text-2xl text-white/80 font-bold mb-8">
                  {USER.title}
                </div>
              )}

              <div className="w-16 h-[2px] bg-[#f9c51d] mx-auto my-10"></div>
              
              <div className="text-xl md:text-3xl text-white/90 leading-relaxed font-bold mb-12 whitespace-pre-line tracking-tight">
                {USER.intro}
              </div>
              
              <div className="mt-12">
                <a 
                  href="#about-me" 
                  className="inline-flex items-center px-8 py-4 rounded-[30px] bg-[#f9c51d] text-black font-bold shadow-sm hover:bg-black hover:text-white transition-all duration-300 text-lg transform hover:-translate-y-1"
                >
                  더 알아보기 <ChevronRight size={20} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. About Me */}
        <section id="about-me" className="py-20 bg-white border-t border-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <SectionTitle title="ABOUT ME" isBlack />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8 px-4">
              <InfoItem icon={<User />} label="이름" value={USER.name} />
              <InfoItem icon={<Calendar />} label="생년월일" value={USER.birthdate} />
              <InfoItem icon={<MapPin />} label="위치" value={USER.location} />
              <InfoItem icon={<Phone />} label="연락처" value={USER.phone} />
              <InfoItem icon={<Mail />} label="이메일" value={USER.email} />
              <InfoItem icon={<GraduationCap />} label="학력" value={USER.education} />
            </div>
          </div>
        </section>

        {/* 4. Skills (하얀 테두리 제거, 카드 넓힘, 글자 크기 축소) */}
        <section id="skills" className="py-20 bg-[#f9c51d]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-center gap-2 mb-10">
              <LinkIcon className="w-5 h-5 text-gray-800 opacity-50" />
              <h3 className="text-4xl font-extrabold border-b-2 border-black pb-1 tracking-tighter text-[#222]">
                SKILLS
              </h3>
            </div>

            {/* 외부 테두리 div 제거 및 내부 카드를 바로 배치 */}
            <div className="bg-white rounded-[20px] p-6 md:p-10 shadow-xl space-y-5">
              {SKILLS_DATA.map((skillGroup) => (
                <div key={skillGroup.category} className="flex flex-col md:flex-row gap-3 md:gap-8 pb-5 last:pb-0 border-b last:border-0 border-gray-100">
                  {/* 카테고리 제목 크기 축소: text-lg -> text-base */}
                  <div className="md:w-40 flex-shrink-0 flex items-center gap-2 text-gray-800 font-bold text-base">
                    <span className="text-[#f9c51d] drop-shadow-sm">{skillGroup.icon}</span>
                    <span>{skillGroup.category}</span>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 items-center">
                    {skillGroup.items.map((item) => (
                      /* 뱃지 텍스트 크기 축소: text-sm -> text-xs */
                      <span 
                        key={item}
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-default border border-gray-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Archiving */}
        <section id="archiving" className="py-20 bg-[#222] text-white">
          <div className="max-w-5xl mx-auto px-6">
            <SectionTitle title="ARCHIVING" />

            <div className="grid md:grid-cols-2 gap-8">
              {archivingList.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.url}
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-white/10 p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer border border-white/5 group"
                >
                  <div className="flex items-start gap-6">
                    <div className="bg-white text-black p-3 rounded-full group-hover:bg-[#f9c51d] transition-colors">
                      {item.type === 'github' ? <Github size={32} /> : <Globe size={32} />}
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-2 text-white">
                        {item.title}
                      </div>
                      <div className="text-gray-400 text-sm mb-4 font-mono">{item.url}</div>
                      <p className="text-gray-300 font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Projects */}
        <section id="projects" className="py-20 bg-blue-50">
           <div className="max-w-5xl mx-auto px-6">
            <SectionTitle title="PROJECTS" isBlack />

            <div className="space-y-12">
              {PROJECTS.map((project: any) => (
                <article key={project.id} className="bg-white rounded-[20px] p-8 md:p-12 shadow-lg border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-1">
                       <h4 className="text-3xl font-bold text-[#222] text-center md:text-left mb-2">
                         {project.name}
                       </h4>
                       <div className="text-gray-500 text-center md:text-left mb-6 font-medium">
                         {project.period}
                       </div>

                       <div className="flex flex-col md:flex-row gap-8">
                         <div className="flex-1">
                            <div className="bg-gray-50 p-5 rounded-xl mb-6 border-l-4 border-[#f9c51d] text-gray-700 leading-relaxed shadow-sm">
                              {project.description}
                            </div>
                            
                            {project.bullets && project.bullets.length > 0 && (
                              <div className="space-y-2 mb-6">
                                {project.bullets.map((bullet: string, i: number) => (
                                  <div key={i} className="flex items-start gap-3 text-gray-700">
                                    <span className="mt-2 w-1.5 h-1.5 bg-black rounded-full flex-shrink-0"></span>
                                    <span>{bullet}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
                                {project.techs.map((tech: string) => (
                                  <span key={tech} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-full border border-blue-100">
                                    {tech}
                                  </span>
                                ))}
                            </div>
                         </div>
                         
                         <div className="md:w-40 flex-shrink-0 flex flex-col gap-3">
                            {project.repoUrl && (
                              <a href={project.repoUrl} className="flex items-center justify-center gap-2 w-full py-3 bg-[#222] text-white rounded-lg hover:bg-[#f9c51d] hover:text-black transition-colors font-bold shadow-sm">
                                <Github size={18} /> GitHub
                              </a>
                            )}
                            <a href="#" className="flex items-center justify-center gap-2 w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm">
                               <Globe size={18} /> URL
                            </a>
                         </div>
                       </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
           </div>
        </section>

        {/* 7. Career */}
        <section id="career" className="py-20 bg-[#F5F5F5]">
          <div className="max-w-5xl mx-auto px-6">
            <SectionTitle title="CAREER" isBlack />

            <div className="space-y-8 px-4">
              {CAREER_DATA.map((job, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <div className="md:w-64 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4">
                    <div className={`w-16 h-16 md:w-48 md:h-48 rounded-full md:rounded-none bg-white border border-gray-200 flex items-center justify-center overflow-hidden p-4 shadow-sm ${job.logoBg}`}>
                      <Briefcase size={40} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 pt-2 border-l-2 border-gray-300 pl-8 md:pl-12 relative">
                    <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-[#222] border-4 border-[#F5F5F5]"></div>
                    <h4 className="text-2xl font-bold text-[#222] mb-1">
                      {job.name}
                    </h4>
                    <div className="text-gray-500 font-medium mb-4 text-sm">
                      {job.period}
                    </div>
                    <div className="text-gray-800 mb-4 font-medium text-lg">
                      {job.description}
                    </div>
                    
                    <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                       {job.roles.map((role, rIdx) => (
                         <li key={rIdx}>{role}</li>
                       ))}
                    </ul>

                    {job.isCurrent && (
                      <span className="inline-block bg-black text-white text-xs font-bold px-2 py-1 rounded">
                        재직 중
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-[#222] text-white text-center">
            <div className="flex justify-center gap-6 mb-8">
               <a href={USER.githubUrl} className="p-3 bg-white/10 rounded-full hover:bg-[#f9c51d] hover:text-black transition-colors">
                 <Github size={24} />
               </a>
               <a href={USER.website} className="p-3 bg-white/10 rounded-full hover:bg-[#f9c51d] hover:text-black transition-colors">
                 <Globe size={24} />
               </a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024. {USER.name}. All rights reserved.<br/>
              Designed by {USER.name}
            </p>
        </footer>
      </main>
    </div>
  );
}

/**
 * Helper Components
 */

function SectionTitle({ title, isBlack }: { title: string, isBlack?: boolean }) {
  return (
    <div className="flex items-center justify-center mb-16">
      <h3 className={`text-4xl font-extrabold border-b-2 pb-2 tracking-tighter inline-block ${isBlack ? 'text-[#222] border-black' : 'text-white border-white'}`}>
        {title}
      </h3>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col group">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 flex items-center justify-center">
          {React.cloneElement(icon as React.ReactElement, { size: 26, className: 'text-[#222]' })}
        </div>
        <span className="font-bold text-xl text-[#222] tracking-tight">{label}</span>
      </div>
      <div className="pl-11 text-gray-600 font-medium text-base break-keep leading-relaxed">
        {value}
      </div>
    </div>
  );
}
