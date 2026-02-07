// types/solution.ts

export interface DailyActivityResponse {
    date: string;
    count: number;
}

export interface UserProgressResponse {
    id: string;
    topic: string;
    confidence: number;
}