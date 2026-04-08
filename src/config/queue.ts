import type {TaskResponse} from '@/types/task';
import type {SolutionStatus} from '@/types/solution';

export interface QueueState {
    tasks: TaskResponse[];
    currentIndex: number;
    lastUpdated: number;
    // Кэш кода: taskId -> languageId -> source code
    codeCache: Record<string, Record<string, string>>;
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
}