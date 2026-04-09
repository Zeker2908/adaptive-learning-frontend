// types/queue.ts
import type {TaskResponse} from '@/types/task';
import type {Language as BackendLanguage, SolutionStatus} from '@/types/solution';

export interface SubmissionResult {
    id: string;
    status: SolutionStatus;
    feedback: string;
    answer?: string;
    language?: BackendLanguage;
    submittedAt: number;
}

export interface QueueState {
    tasks: TaskResponse[];
    currentIndex: number;
    lastUpdated: number;
    codeCache: Record<string, Record<string, string>>;
    taskResults: Record<string, SubmissionResult[]>;
    solvedTasks: Set<string>;
    stats: QueueStats
}

export interface QueueStats {
    solved: number;
    failed: number;
    streak: number;
}

export interface SubmissionState {
    isLoading: boolean;
    solutionId: string | null;
    status: SolutionStatus | null;
    feedback: string;
    error: string | null;
}

export interface UseQueueReturn {
    // Данные
    tasks: TaskResponse[];
    currentTask: TaskResponse | null;
    currentIndex: number;
    totalLoaded: number;

    stats: QueueStats;
    updateStats: (status: SolutionStatus) => void;

    // Навигация
    goToNext: () => void;
    goToPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;

    // Код
    selectedLanguage: string;
    setSelectedLanguage: (langId: string) => void;
    code: string;
    setCode: (code: string) => void;

    // Загрузка
    isLoading: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;

    // Состояние очереди
    isQueueEmpty: boolean;
    isLastTask: boolean;

    // 🔹 Результаты и блокировка
    taskResults: SubmissionResult[];
    isTaskSolved: boolean;
    canSubmit: boolean;
    markTaskAsSolved: (taskId: string) => void;
    addSubmissionResult: (taskId: string, result: SubmissionResult) => void;
}