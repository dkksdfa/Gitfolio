import { Template } from '@/types/template';

export const allTemplates: Template[] = [
    {
        id: 'meganmagic',
        name: '메건 매직',
        description: '마법처럼 애니메이션 효과가 적용된 포트폴리오 템플릿입니다.',
        image: '/thumbnails/meganmagic.png',
        fields: ['profile', 'projects', 'experiences', 'skills', 'educations', 'awards', 'blogPosts'],
    },
    {
        id: 'cdg',
        name: 'CDG (최덕경)',
        description: '심플하고 정보 중심적인 이력/포트폴리오 레이아웃입니다 (CDG 레퍼런스 기반).',
        image: '/thumbnails/cdg.png',
        fields: ['profile', 'projects', 'skills', 'experiences', 'archiving'],
        usesSkillCategories: true,
    },
    {
        id: 'modern',
        name: 'Modern Dev',
        description: '세련된 다크모드 지원 개발자 포트폴리오 템플릿입니다.',
        image: '/thumbnails/modern.png',
        fields: ['profile', 'projects', 'skills'],
        usesSkillCategories: true,
    },
    {
        id: 'aurora',
        name: 'Aurora',
        description: '부드러운 핑크빛 포인트 컬러와 깔끔한 섹션 구성이 돋보이는 템플릿입니다.',
        image: '/thumbnails/aurora.png',
        fields: ['profile', 'projects', 'skills', 'experiences', 'archiving'],
    },
];

export default allTemplates;
