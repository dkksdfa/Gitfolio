import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    contact: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    github: z.string().url('Invalid URL').optional(),
    linkedin: z.string().url('Invalid URL').optional(),
    bio: z.string().optional(),
});

export const projectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    url: z.string().url('Invalid URL').optional(),
    githubUrl: z.string().url('Invalid URL').optional(),
    stack: z.array(z.string()).optional(),
    imageUrl: z.string().url('Invalid URL').optional(),
});

export const experienceSchema = z.object({
    company: z.string().min(1, 'Company is required'),
    role: z.string().min(1, 'Role is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
});

export const skillSchema = z.object({
    name: z.string().min(1, 'Skill name is required'),
    level: z.number().min(1).max(5).optional(),
});

export const educationSchema = z.object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
});

export const awardSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    date: z.string().optional(),
});

export const portfolioSchema = z.object({
    template: z.string(),
    profile: profileSchema,
    projects: z.array(projectSchema).optional(),
    experiences: z.array(experienceSchema).optional(),
    skills: z.array(skillSchema).optional(),
    educations: z.array(educationSchema).optional(),
    awards: z.array(awardSchema).optional(),
});

export type Profile = z.infer<typeof profileSchema>;
// export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Award = z.infer<typeof awardSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;

// 이전 버전과의 호환성을 위한 타입 정의
export interface Project {
    id: number | string;
    name: string;
    description: string;
    url?: string;
    period?: string;
    summary?: string;
    techs?: string[];
    stargazers_count?: number;
    created_at?: string;
    updated_at?: string;
    languages?: Record<string, number>;
}

export interface Career {
    id: number | string;
    company: string;
    role: string;
    start: string;
    end: string;
    description: string;
}
