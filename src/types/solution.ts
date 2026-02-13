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

export interface TaskStatisticsResponse {
    totalSolutions: number;
    successfulSolutions: number;
    successRate: number;
    averageConfidence: number;
    weakestTopics: string[];
}