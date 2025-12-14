import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code2, 
  Terminal, 
  Cpu, 
  Globe,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

/**
 * --------------------------------------------------------------------------
 * 데이터 정의 (실제로는 data.ts 등으로 분리해서 관리하면 편합니다)
 * --------------------------------------------------------------------------
 */

const PROFILE = {
  name: "김개발",
  role: "Frontend Developer",
  bio: "사용자 경험을 최우선으로 생각하는 웹 개발자입니다. 복잡한 문제를 직관적인 코드로 해결하는 것을 좋아하며, 항상 새로운 기술에 열려있습니다.",
  email: "dev.kim@example.com",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
};

const SKILLS = [
  { name: "React / Next.js", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "Tailwind CSS", level: 95 },
  { name: "Node.js", level: 70 },
  { name: "Figma", level: 60 },
];

const PROJECTS = [
  {
    id: 1,
    title: "E-Commerce Dashboard",
    description: "Next.js와 Supabase를 활용하여 구축한 관리자 대시보드입니다. 실시간 매출 데이터 시각화 및 재고 관리 기능을 제공합니다.",
    tags: ["Next.js", "TypeScript", "Recharts", "Supabase"],
    link: "#",
    github: "#",
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Task Flow App",
    description: "팀 협업을 위한 칸반 보드 스타일의 프로젝트 관리 도구입니다. 드래그 앤 드롭 인터페이스와 실시간 업데이트를 지원합니다.",
    tags: ["React", "Redux Toolkit", "Firebase", "Dnd-kit"],
    link: "#",
    github: "#",
    color: "bg-indigo-500"
  },
  {
    id: 3,
    title: "AI Chat Interface",
    description: "Gemini API를 연동한 생성형 AI 채팅 인터페이스입니다. 스트리밍 응답 처리와 마크다운 렌더링을 구현했습니다.",
    tags: ["OpenAI API", "Next.js", "Tailwind", "Vercel AI SDK"],
    link: "#",
    github: "#",
    color: "bg-emerald-500"
  }
];

/**
 * --------------------------------------------------------------------------
 * 컴포넌트 정의
 * --------------------------------------------------------------------------
 */

// 1. 네비게이션 바
const Navbar = ({ darkMode, toggleDarkMode }: { darkMode: boolean, toggleDarkMode: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 font-bold text-2xl tracking-tighter text-indigo-600 dark:text-indigo-400">
            DEV.KIM
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {link.name}
                </a>
              ))}
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             <button onClick={toggleDarkMode} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 dark:text-slate-300 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// 2. 히로 섹션 (소개)
const Hero = () => (
  <section id="about" className="min-h-screen flex items-center justify-center pt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
      <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
        <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
          Welcome to my portfolio
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
          Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{PROFILE.name}</span>
          <br />
          Building Digital Experiences.
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto md:mx-0 leading-relaxed">
          {PROFILE.bio}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <a href="#projects" className="px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center">
            View Projects <ExternalLink size={18} className="ml-2" />
          </a>
          <a href="#contact" className="px-8 py-3 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center">
            Contact Me
          </a>
        </div>
        <div className="mt-12 flex justify-center md:justify-start space-x-6 text-slate-500 dark:text-slate-400">
          <a href={PROFILE.github} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"><Github size={24} /></a>
          <a href={PROFILE.linkedin} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"><Linkedin size={24} /></a>
          <a href={`mailto:${PROFILE.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"><Mail size={24} /></a>
        </div>
      </div>
      
      {/* Hero Image / Visual */}
      <div className="md:w-1/2 flex justify-center relative">
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500">
             <div className="text-center p-8">
                <Code2 size={64} className="mx-auto text-indigo-600 mb-4" />
                <div className="font-mono text-sm text-slate-400 text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-lg w-full">
                  <span className="text-purple-500">const</span> developer = <span className="text-yellow-500">{'{'}</span><br/>
                  &nbsp;&nbsp;name: <span className="text-green-500">"Kim"</span>,<br/>
                  &nbsp;&nbsp;passion: <span className="text-green-500">"Infinity"</span><br/>
                  <span className="text-yellow-500">{'}'}</span>;
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400 hidden md:block">
      <ChevronDown size={32} />
    </div>
  </section>
);

// 3. 스킬 섹션
const Skills = ({ user }: { user?: any }) => {
  // Parse user skills if available
  const userSkills = React.useMemo(() => {
    if (user?.skills && user.skills.length > 0) {
      return user.skills.map((s: string) => {
        const name = s.includes(':') ? s.split(':')[1] : s;
        return { name, level: 80 }; // Default level for user input
      });
    }
    return SKILLS;
  }, [user]);

  // Parse categories for the grid below
  const categories = React.useMemo(() => {
    if (user?.skills && user.skills.length > 0) {
       const grouped: Record<string, string[]> = {
         'Backend': [], 'Frontend': [], 'Tools': [], 'Language': []
       };
       user.skills.forEach((s: string) => {
         if (s.includes(':')) {
           const [cat, name] = s.split(':');
           if (grouped[cat]) grouped[cat].push(name);
         }
       });
       return grouped;
    }
    return null;
  }, [user]);

  return (
  <section id="skills" className="py-20 bg-slate-50 dark:bg-slate-900/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Technical Skills</h2>
        <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">제가 주로 사용하는 기술 스택입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {userSkills.map((skill: any) => (
            <div key={skill.name}>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{skill.level}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
            <Terminal size={40} className="text-indigo-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white">Backend</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {categories ? categories['Backend'].join(', ') : "Node.js, Express, Supabase"}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
            <Globe size={40} className="text-purple-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white">Frontend</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {categories ? categories['Frontend'].join(', ') : "React, Next.js, Tailwind"}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
            <Cpu size={40} className="text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white">Tools</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {categories ? categories['Tools'].join(', ') : "Git, Docker, Vercel"}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
             <Code2 size={40} className="text-orange-500 mb-3" />
             <h3 className="font-bold text-slate-900 dark:text-white">Language</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
               {categories ? categories['Language'].join(', ') : "TypeScript, JavaScript, Python"}
             </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

// 4. 프로젝트 섹션
const Projects = () => (
  <section id="projects" className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Projects</h2>
        <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">최근 진행한 주요 프로젝트들입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROJECTS.map((project) => (
          <div key={project.id} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
            {/* Project Image Placeholder */}
            <div className={`h-48 ${project.color} bg-opacity-20 dark:bg-opacity-10 flex items-center justify-center relative overflow-hidden`}>
              <div className={`absolute inset-0 ${project.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              <h3 className={`text-2xl font-bold text-slate-900 dark:text-white z-10`}>{project.title}</h3>
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <a href={project.github} className="flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  <Github size={16} className="mr-2" /> Code
                </a>
                <a href={project.link} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition">
                  Live Demo <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// 5. 컨택 섹션
const Contact = () => (
  <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-900/50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Get In Touch</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-12 text-lg">
        새로운 프로젝트 논의나 채용 관련 문의는 언제든 환영합니다.
      </p>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a href={`mailto:${PROFILE.email}`} className="flex flex-col items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition group">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{PROFILE.email}</p>
          </a>
          
          <a href={PROFILE.linkedin} className="flex flex-col items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Linkedin size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">LinkedIn</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Connect with me</p>
          </a>
          
          <a href={PROFILE.github} className="flex flex-col items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition group">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Github size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">GitHub</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Follow my work</p>
          </a>
        </div>
      </div>
    </div>
  </section>
);

// 6. 푸터
const Footer = () => (
  <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center">
    <p className="text-slate-500 dark:text-slate-400 text-sm">
      © 2025 {PROFILE.name}. All rights reserved. Built with Next.js & Tailwind CSS.
    </p>
  </footer>
);

/**
 * --------------------------------------------------------------------------
 * 메인 App 컴포넌트
 * --------------------------------------------------------------------------
 */
export default function Modern({ user, repos }: { user: any, repos: any }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main>
          <Hero />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
