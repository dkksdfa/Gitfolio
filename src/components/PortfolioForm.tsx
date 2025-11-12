'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { allTemplates } from '@/lib/templates';
import { Template } from '@/types/template';
import { Project, Career } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const PortfolioForm = () => {
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [intro, setIntro] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [github, setGithub] = useState('');
    const [location, setLocation] = useState('');

    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const [projects, setProjects] = useState<Project[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [templateMeta, setTemplateMeta] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const [isImporting, setIsImporting] = useState(false); // GitHub 가져오기 로딩 상태
    const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
    const [genError, setGenError] = useState<string | null>(null);

    useEffect(() => {
        const savedTemplate = localStorage.getItem('selected_template');
        if (savedTemplate) {
            const template = allTemplates.find(t => t.id === savedTemplate) || null;
            setSelectedTemplate(template?.id || null);
            setTemplateMeta(template);
        }
        setIsLoading(false); // 확인 완료 후 로딩 상태 false로 변경

        const fetchUserData = async () => {
            try {
                // First, try to fetch from server
                const serverProfileRes = await axios.get('/api/user/profile');
                if (serverProfileRes.data) {
                    const p = serverProfileRes.data;
                    setName(p.name || '');
                    setTitle(p.title || '');
                    setIntro(p.intro || '');
                    setEmail(p.email || '');
                    setPhone(p.phone || '');
                    setResumeUrl(p.resumeUrl || '');
                    setGithub(p.github || '');
                    setLocation(p.location || '');
                    setSkills(p.skills || []);
                    setProjects(p.projects || []);
                    setCareers(p.careers || []);
                }
            } catch (e) {
                // If server fetch fails (e.g., 404), fallback to localStorage
                console.log("No server profile found, falling back to localStorage.");
                try {
                    const personalRaw = localStorage.getItem('portfolio_personal');
                    if (personalRaw) {
                        const p = JSON.parse(personalRaw);
                        setName(prev => prev || p.name || '');
                        setEmail(prev => prev || p.email || '');
                        setPhone(prev => prev || p.phone || '');
                        setGithub(prev => prev || p.github || '');
                        setLocation(prev => prev || p.location || '');
                    }

                    const saved = localStorage.getItem('portfolio_profile');
                    if (saved) {
                        const obj = JSON.parse(saved);
                        setName(obj.name || '');
                        setTitle(obj.title || '');
                        setIntro(obj.intro || '');
                        setEmail(obj.email || '');
                        setPhone(obj.phone || '');
                        setResumeUrl(obj.resumeUrl || '');
                        setGithub(obj.github || '');
                        setLocation(obj.location || '');
                        setSkills(obj.skills || []);
                        setProjects(obj.projects || []);
                        setCareers(obj.careers || []);
                    }
                } catch (localError) {
                    console.error("Failed to parse from localStorage", localError);
                }
            }

            // Always read selected template from local storage for UI purposes
            try {
                const sel = localStorage.getItem('selected_template');
                if (sel) {
                    setSelectedTemplate(sel);
                    const meta = allTemplates.find(t => t.id === sel) || null;
                    setTemplateMeta(meta);
                }
            } catch (e) {
                // ignore template error
            }
        };

        fetchUserData();
    }, []);

    const save = async () => {
        const payload = { name, title, intro, email, phone, resumeUrl, github, location, skills, projects, careers };
        try {
            await axios.post('/api/user/profile', payload);
            alert('프로필이 서버에 저장되었습니다.');
        } catch (e) {
            console.error('Failed to save profile to server', e);
            alert('서버 저장에 실패했습니다. 로컬에만 저장됩니다.');
        }

        // Also save to local storage as a backup/for offline
        localStorage.setItem('portfolio_profile', JSON.stringify(payload));
        const personal = { name, email, phone, github, location };
        localStorage.setItem('portfolio_personal', JSON.stringify(personal));
    };

    const reset = () => {
        if (!confirm('모든 입력을 초기화하시겠습니까?')) return;
        setName(''); setTitle(''); setIntro(''); setEmail(''); setPhone(''); setGithub(''); setLocation('');
        setResumeUrl('');
        setSkills([]); setProjects([]); setCareers([]);
        localStorage.removeItem('portfolio_profile');
        localStorage.removeItem('portfolio_personal');
        // Optionally, you could also send a delete request to the server
    };

    const addSkill = () => {
        const v = skillInput.trim();
        if (!v) return;
        if (!skills.includes(v)) setSkills(prev => [...prev, v]);
        setSkillInput('');
    };

    const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

    const importFromGithub = async () => {
        setIsImporting(true);
        try {
            const response = await axios.get('/api/github/all-repos');
            const repos = response.data;
            setProjects(repos.map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                url: repo.html_url,
                description: repo.description || '',
            })));
        } catch (error) {
            console.error("Failed to import from GitHub", error);
            alert("GitHub에서 프로젝트를 가져오는 데 실패했습니다.");
        } finally {
            setIsImporting(false);
        }
    };

    const addProject = () => {
        const id = Date.now();
        setProjects(prev => [...prev, { id, name: '새 프로젝트', description: '', url: '' }]);
    };

    const updateProject = (id: string | number, field: keyof Project, value: any) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removeProject = (id: string | number) => setProjects(prev => prev.filter(p => p.id !== id));

    const addCareer = () => {
        const id = Date.now();
        setCareers(prev => [...prev, { id, company: '', role: '', start: '', end: '', description: '' }]);
    };

    const updateCareer = (id: string | number, field: keyof Career, value: any) => {
        setCareers(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeCareer = (id: string | number) => setCareers(prev => prev.filter(c => c.id !== id));

    // Helper: parse github url like https://github.com/owner/repo or git@github.com:owner/repo.git
    const parseGithubUrl = (url?: string) => {
        if (!url) return null;
        try {
            // Normalize
            const cleaned = url.trim().replace(/\.git$/, '').replace(/:\/\//, '://');
            // If ssh style git@github.com:owner/repo
            const sshMatch = cleaned.match(/git@github.com:(.+?)\/(.+?)(?:$|\/)/);
            if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2] };

            const u = new URL(cleaned);
            if (u.hostname !== 'github.com' && !u.hostname.endsWith('github.com')) return null;
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length < 2) return null;
            return { owner: parts[0], repo: parts[1] };
        } catch (e) {
            return null;
        }
    };

    const generateProjectDescription = async (index: number) => {
        const project = projects[index];
        if (!project) return;
        const parsed = parseGithubUrl(project.url || '');
        if (!parsed) {
            alert('유효한 GitHub URL이 필요합니다. 예: https://github.com/owner/repo');
            return;
        }

        setGeneratingIndex(index);
        setGenError(null);
        try {
            const body = { owner: parsed.owner, repo: parsed.repo, title: project.name || '', description: project.description || '' };
            const res = await axios.post('/api/ai/summarize', body);
            const summary = res.data?.summary;
            if (summary) {
                const newProjects = projects.map((p, i) => i === index ? { ...p, description: summary } : p);
                setProjects(newProjects);
                // update local storage backup
                try {
                    const prev = JSON.parse(localStorage.getItem('portfolio_profile') || '{}');
                    const merged = { ...prev, projects: newProjects };
                    localStorage.setItem('portfolio_profile', JSON.stringify(merged));
                } catch (e) {
                    // ignore localStorage write errors
                }
            } else {
                setGenError('요약을 생성하지 못했습니다.');
                alert('요약을 생성하지 못했습니다.');
            }
        } catch (error) {
            console.error('Failed to generate summary', error);
            setGenError('요약 생성 중 오류가 발생했습니다.');
            alert('요약 생성 중 오류가 발생했습니다.');
        } finally {
            setGeneratingIndex(null);
        }
    };

    const isFieldVisible = (field: string) => {
        if (!templateMeta) return false;
        return templateMeta?.fields?.includes(field as any) ?? false;
    };

    if (isLoading) {
        return null; // 또는 로딩 스피너를 보여줄 수 있습니다.
    }

    if (!selectedTemplate) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
                <h2 className="text-2xl font-semibold mb-8 text-center">시작하려면 템플릿을 선택하세요</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {allTemplates.map(t => (
                        <Card key={t.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                            setSelectedTemplate(t.id);
                            setTemplateMeta(t);
                            localStorage.setItem('selected_template', t.id);
                        }}>
                            <CardContent className="p-4">
                                <img src={t.image} alt={t.name} className="w-full h-48 object-cover rounded-md mb-4" />
                                <h3 className="text-lg font-bold">{t.name}</h3>
                                <p className="text-sm text-gray-600">{t.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">"<span className="text-indigo-600">{templateMeta?.name}</span>" 템플릿 편집 중</h2>
                <Button variant="outline" onClick={() => {
                    setSelectedTemplate(null);
                    setTemplateMeta(null);
                    localStorage.removeItem('selected_template');
                }}>템플릿 변경</Button>
            </div>


            {isFieldVisible('profile') && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">프로필 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600">이름</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">한 줄 소개 / 직함</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm text-gray-600">자기소개</label>
                                <Textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">이메일</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">연락처</label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">이력서 URL (선택)</label>
                                <Input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://...pdf" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">GitHub URL</label>
                                <Input value={github} onChange={(e) => setGithub(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">위치</label>
                                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}


            {isFieldVisible('skills') && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">기술 스택</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="기술 스택을 입력하고 Enter를 누르세요" />
                            <Button onClick={addSkill}>추가</Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {skills.map(s => (
                                <span key={s} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                                    <span className="text-sm">{s}</span>
                                    <Button variant="ghost" size="sm" onClick={() => removeSkill(s)} className="text-xs text-red-500 h-auto p-0">x</Button>
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {isFieldVisible('projects') && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">프로젝트</h3>
                        <div className="flex gap-2 mt-2 mb-4">
                            <Button onClick={addProject} variant="secondary">새 프로젝트 추가</Button>
                            <Button onClick={importFromGithub} disabled={isImporting}>
                                {isImporting ? '가져오는 중...' : 'GitHub에서 가져오기'}
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {projects.map((p, idx) => (
                                <Card key={String(p.id)} className="p-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Input value={p.name} onChange={(e) => updateProject(p.id, 'name', e.target.value)} placeholder="프로젝트 이름" />
                                            <Input value={p.url || ''} onChange={(e) => updateProject(p.id, 'url', e.target.value)} placeholder="프로젝트 URL" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button onClick={() => generateProjectDescription(idx)} disabled={generatingIndex === idx}>
                                                {generatingIndex === idx ? '생성 중...' : '설명 생성'}
                                            </Button>
                                            <Button onClick={() => removeProject(p.id)} variant="destructive">삭제</Button>
                                        </div>
                                    </div>
                                    <Textarea value={p.description} onChange={(e) => updateProject(p.id, 'description', e.target.value)} className="mt-2" placeholder="프로젝트 설명" rows={3} />
                                    {genError && <p className="text-sm text-red-500 mt-2">{genError}</p>}
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


            {isFieldVisible('experiences') && (
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">경력</h3>
                        <div className="flex gap-2 mt-2 mb-4">
                            <Button onClick={addCareer} variant="secondary">경력 추가</Button>
                        </div>
                        <div className="space-y-4">
                            {careers.map(c => (
                                <Card key={String(c.id)} className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input value={c.company} onChange={(e) => updateCareer(c.id, 'company', e.target.value)} placeholder="회사명" />
                                        <Input value={c.role} onChange={(e) => updateCareer(c.id, 'role', e.target.value)} placeholder="직무" />
                                        <Input value={c.start || ''} onChange={(e) => updateCareer(c.id, 'start', e.target.value)} placeholder="시작일 (예: 2020-01)" />
                                        <Input value={c.end || ''} onChange={(e) => updateCareer(c.id, 'end', e.target.value)} placeholder="종료일 (또는 재직 중)" />
                                    </div>
                                    <Textarea value={c.description || ''} onChange={(e) => updateCareer(c.id, 'description', e.target.value)} className="mt-2" placeholder="담당 역할 및 성과에 대해 설명해주세요." rows={3} />
                                    <Button onClick={() => removeCareer(c.id)} variant="destructive" className="mt-2">삭제</Button>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


            <div className="mt-6 flex gap-2 justify-end">
                <Button onClick={reset} variant="outline">초기화</Button>
                <Button onClick={save}>저장</Button>
            </div>
        </div>
    );
}

export default PortfolioForm;