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

export interface SolutionRequest {
    taskId: string;
    answer: string;
    language?: Language;
}

export interface SolutionResponse {
    id: string;
    userId: string;
    taskId: string;
    answer: string;
    language: Language;
    status: SolutionStatus;
    feedBack: string;
}

export const SolutionStatus = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    TIMEOUT: "TIMEOUT",
} as const;

export type SolutionStatus =
    typeof SolutionStatus[keyof typeof SolutionStatus];

export const SolutionStatusLabels: Record<SolutionStatus, string> = {
    PENDING: "В обработке",
    SUCCESS: "Успешно",
    FAILED: "Ошибка",
    SERVICE_UNAVAILABLE: "Сервис недоступен",
    TIMEOUT: "Превышено время ожидания",
};

export const Language = {
    JAVA: "JAVA_OPENJDK_13_0_1",
    PYTHON: "PYTHON_3_8_1",
    JAVASCRIPT: "JAVASCRIPT_NODEJS_12_14_0",
    TYPESCRIPT: "TYPESCRIPT_3_7_4",
    CPP: "CPP_GCC_9_2_0",
    C: "C_GCC_9_2_0",
    GO: "GO_1_13_5",
    RUST: "RUST_1_40_0",
    KOTLIN: "KOTLIN_1_3_70",
    CSHARP: "C_SHARP_MONO_6_6_0_161",
} as const;
export type Language = typeof Language[keyof typeof Language];

export const LanguageLabels: Record<Language, string> = {
    [Language.JAVA]: "Java",
    [Language.PYTHON]: "Python",
    [Language.JAVASCRIPT]: "JavaScript",
    [Language.TYPESCRIPT]: "TypeScript",
    [Language.CPP]: "C++",
    [Language.C]: "C",
    [Language.GO]: "Go",
    [Language.RUST]: "Rust",
    [Language.KOTLIN]: "Kotlin",
    [Language.CSHARP]: "C#",
};