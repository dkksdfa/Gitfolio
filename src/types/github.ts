export interface IRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    language: string | null;
    languages: Record<string, number>;
    owner: {
        login: string;
        avatar_url: string;
    };
    updated_at: string;
    created_at: string;
    pushed_at: string;
    topics: string[];
    license: {
        name: string;
    } | null;
    private: boolean;
    archived: boolean;
    disabled: boolean;
    contributor_count?: number;
    commit_count?: number;
}

export interface IRepoDetail extends IRepo {
    languages: Record<string, number>;
    contributor_count: number;
}

export interface IContribution {
    repo: IRepo;
    languages: Record<string, number>;
    contributor_count: number;
}
