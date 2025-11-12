export interface Template {
    id: string;
    name: string;
    description: string;
    image: string;
    // allowed field keys used by templates
    fields: Array<'profile' | 'projects' | 'experiences' | 'skills' | 'educations' | 'awards'>;
}
