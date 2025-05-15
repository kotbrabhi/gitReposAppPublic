export interface Repository {
    id: number;
    full_name: string;
    name:string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    html_url: string;
    created_at:string;
    owner: {
      login: string;
      avatar_url: string;
      html_url: string;
    };
  }