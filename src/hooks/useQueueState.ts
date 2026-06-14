// /hooks/useQueueState.ts
import {useCallback, useEffect, useRef, useState} from 'react';
import {recommendationService} from '@/services/recommendationService';
import type {QueueState, SubmissionResult, UseQueueReturn} from '@/types/queue';
import {getLangById, LANGUAGES} from '@/types/languages';
import type {SolutionStatus} from "@/types/solution.ts";
import type {TaskResponse} from '@/types/task';

const STORAGE_KEY = 'infinite_queue_state';
const STORAGE_TTL = 1000 * 60 * 60;
const MAX_RESULTS_PER_TASK = 3;
const MAX_ATTEMPTS = 3;
const INITIAL_BATCH_SIZE = 5;
const LOAD_MORE_BATCH_SIZE = 10;
const PREFETCH_REMAINING = 2;

interface PersistedQueueProgress {
    currentTaskId: string | null;
    lastUpdated: number;
    codeCache: QueueState['codeCache'];
    taskResults: QueueState['taskResults'];
    solvedTasks: string[];
    stats: QueueState['stats'];
}

export function clearQueueStorage() {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[Queue] Storage cleared');
    } catch (e) {
        console.warn('[Queue] Failed to clear storage:', e);
    }
}

function getInitialProgress(): PersistedQueueProgress {
    return {
        currentTaskId: null,
        lastUpdated: Date.now(),
        codeCache: {},
        taskResults: {},
        solvedTasks: [],
        stats: {
            solved: 0,
            failed: 0,
            streak: 0,
        },
    };
}

function getInitialState(): QueueState {
    return {
        tasks: [],
        currentIndex: 0,
        lastUpdated: Date.now(),
        codeCache: {},
        taskResults: {},
        solvedTasks: new Set<string>(),
        stats: {
            solved: 0,
            failed: 0,
            streak: 0,
        },
    };
}

function serializeProgress(state: QueueState, currentTaskId: string | null): PersistedQueueProgress {
    return {
        currentTaskId,
        lastUpdated: Date.now(),
        codeCache: state.codeCache,
        taskResults: state.taskResults,
        solvedTasks: Array.from(state.solvedTasks),
        stats: state.stats,
    };
}

function loadProgressFromStorage(): PersistedQueueProgress {
    try {
        if (typeof window === 'undefined') return getInitialProgress();

        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getInitialProgress();

        const parsed = JSON.parse(raw) as Partial<PersistedQueueProgress> & Partial<QueueState> & {
            solvedTasks?: string[];
        };

        if (Date.now() - (parsed.lastUpdated ?? 0) > STORAGE_TTL) {
            return getInitialProgress();
        }

        return {
            currentTaskId: parsed.currentTaskId ?? null,
            lastUpdated: parsed.lastUpdated ?? Date.now(),
            codeCache: parsed.codeCache ?? {},
            taskResults: parsed.taskResults ?? {},
            solvedTasks: parsed.solvedTasks ?? [],
            stats: parsed.stats ?? getInitialProgress().stats,
        };
    } catch {
        return getInitialProgress();
    }
}

function getTaskById(tasks: TaskResponse[], taskId: string): TaskResponse | undefined {
    return tasks.find(task => task.id === taskId);
}

function isChoiceTask(task: TaskResponse | undefined): boolean {
    const type = task?.content.type;
    return type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE';
}

export function isTaskCompleted(taskId: string, state: Pick<QueueState, 'solvedTasks' | 'taskResults' | 'tasks'>): boolean {
    if (state.solvedTasks.has(taskId)) return true;

    const results = state.taskResults[taskId] || [];
    const failedCount = results.filter(r => r.status === 'FAILED').length;
    const task = getTaskById(state.tasks, taskId);

    if (isChoiceTask(task)) {
        return failedCount >= 1;
    }

    return failedCount >= MAX_ATTEMPTS || results.length >= MAX_ATTEMPTS;
}

function isQueueCompleted(state: QueueState): boolean {
    if (state.tasks.length === 0) return false;

    return state.tasks.every(task => isTaskCompleted(task.id, state));
}

function resolveCurrentIndex(
    tasks: TaskResponse[],
    progress: Pick<QueueState, 'solvedTasks' | 'taskResults' | 'tasks'>,
    preferredTaskId: string | null,
): number {
    if (tasks.length === 0) return 0;

    if (preferredTaskId) {
        const preferredIndex = tasks.findIndex(task => task.id === preferredTaskId);
        if (preferredIndex >= 0 && !isTaskCompleted(preferredTaskId, {...progress, tasks})) {
            return preferredIndex;
        }
    }

    for (let index = 0; index < tasks.length; index += 1) {
        const task = tasks[index];
        if (!isTaskCompleted(task.id, {...progress, tasks})) {
            return index;
        }
    }

    return Math.max(tasks.length - 1, 0);
}

function clampIndex(index: number, tasksLength: number): number {
    if (tasksLength === 0) return 0;
    return Math.min(Math.max(index, 0), tasksLength - 1);
}

function mergeTasks(
    prevTasks: TaskResponse[],
    incomingTasks: TaskResponse[],
    append: boolean,
): TaskResponse[] {
    const taskMap = new Map<string, TaskResponse>();

    if (append) {
        prevTasks.forEach(task => taskMap.set(task.id, task));
    }

    incomingTasks.forEach(task => taskMap.set(task.id, task));

    return Array.from(taskMap.values());
}

function countNewTasks(prevTasks: TaskResponse[], mergedTasks: TaskResponse[]): number {
    const knownIds = new Set(prevTasks.map(task => task.id));
    return mergedTasks.filter(task => !knownIds.has(task.id)).length;
}

export function useQueueState(): UseQueueReturn {
    const initialProgressRef = useRef(loadProgressFromStorage());
    const [state, setState] = useState<QueueState>(() => ({
        ...getInitialState(),
        codeCache: initialProgressRef.current.codeCache,
        taskResults: initialProgressRef.current.taskResults,
        solvedTasks: new Set(initialProgressRef.current.solvedTasks),
        stats: initialProgressRef.current.stats,
        lastUpdated: initialProgressRef.current.lastUpdated,
    }));
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(
        initialProgressRef.current.currentTaskId
    );

    const stateRef = useRef(state);
    const currentTaskIdRef = useRef(currentTaskId);
    const loadChainRef = useRef(Promise.resolve(0));
    const initialLoadDoneRef = useRef(false);
    const skipNextPersistRef = useRef(true);

    stateRef.current = state;
    currentTaskIdRef.current = currentTaskId;

    const saveProgress = useCallback((nextState: QueueState, nextTaskId: string | null) => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(serializeProgress(nextState, nextTaskId))
            );
        } catch (e) {
            console.warn('Failed to save queue state:', e);
        }
    }, []);

    useEffect(() => {
        if (skipNextPersistRef.current) {
            skipNextPersistRef.current = false;
            return;
        }
        saveProgress(state, currentTaskId);
    }, [state, currentTaskId, saveProgress]);

    const applyLoadedTasks = useCallback((
        incomingTasks: TaskResponse[],
        append: boolean,
        preferredTaskId: string | null,
    ): number => {
        let addedCount = 0;
        let nextTaskId: string | null = null;

        setState(prev => {
            const mergedTasks = mergeTasks(prev.tasks, incomingTasks, append);
            addedCount = countNewTasks(prev.tasks, mergedTasks);

            const nextState: QueueState = {
                ...prev,
                tasks: mergedTasks,
                lastUpdated: Date.now(),
            };

            const nextIndex = resolveCurrentIndex(mergedTasks, nextState, preferredTaskId);
            nextState.currentIndex = clampIndex(nextIndex, mergedTasks.length);
            nextTaskId = mergedTasks[nextState.currentIndex]?.id ?? null;

            return nextState;
        });

        setCurrentTaskId(nextTaskId);
        return addedCount;
    }, []);

    const performLoad = useCallback(async (append: boolean): Promise<number> => {
        setIsLoading(true);

        try {
            const incomingTasks = await recommendationService.getRecommendations({
                limit: append ? LOAD_MORE_BATCH_SIZE : INITIAL_BATCH_SIZE,
            });

            if (!Array.isArray(incomingTasks)) {
                console.error('[Queue] Invalid recommendations response:', incomingTasks);
                return 0;
            }

            const preferredTaskId = append ? currentTaskIdRef.current : null;
            const addedCount = applyLoadedTasks(incomingTasks, append, preferredTaskId);

            if (append && addedCount === 0 && incomingTasks.length > 0) {
                applyLoadedTasks(incomingTasks, false, null);
                return incomingTasks.length;
            }

            return incomingTasks.length;
        } catch (error) {
            console.error('[Queue] Failed to load:', error);
            return 0;
        } finally {
            setIsLoading(false);
        }
    }, [applyLoadedTasks]);

    const enqueueLoad = useCallback((append: boolean): Promise<number> => {
        const loadPromise = loadChainRef.current
            .catch(() => 0)
            .then(() => performLoad(append));

        loadChainRef.current = loadPromise.then(() => 0);
        return loadPromise;
    }, [performLoad]);

    const ensureMoreTasks = useCallback(async (): Promise<boolean> => {
        const snapshot = stateRef.current;
        const currentIndex = clampIndex(snapshot.currentIndex, snapshot.tasks.length);
        const remaining = snapshot.tasks.length - 1 - currentIndex;

        if (remaining > 0) {
            return true;
        }

        const added = await enqueueLoad(true);
        if (added > 0) {
            return true;
        }

        const replaced = await enqueueLoad(false);
        return replaced > 0;
    }, [enqueueLoad]);

    const moveToNextTask = useCallback(() => {
        let nextTaskId: string | null = null;

        setState(prev => {
            if (prev.tasks.length === 0) {
                return prev;
            }

            const currentIndex = clampIndex(prev.currentIndex, prev.tasks.length);
            let nextIndex = currentIndex + 1;

            while (nextIndex < prev.tasks.length && isTaskCompleted(prev.tasks[nextIndex].id, prev)) {
                nextIndex += 1;
            }

            if (nextIndex >= prev.tasks.length) {
                const fallbackIndex = Math.max(prev.tasks.length - 1, 0);
                nextTaskId = prev.tasks[fallbackIndex]?.id ?? null;
                return {
                    ...prev,
                    currentIndex: fallbackIndex,
                };
            }

            nextTaskId = prev.tasks[nextIndex]?.id ?? null;
            return {
                ...prev,
                currentIndex: nextIndex,
            };
        });

        setCurrentTaskId(nextTaskId);
    }, []);

    const handleEndOfQueue = useCallback(async () => {
        const snapshot = stateRef.current;

        if (isQueueCompleted(snapshot)) {
            setState(prev => ({
                ...getInitialState(),
                stats: prev.stats,
                codeCache: prev.codeCache,
                taskResults: prev.taskResults,
                solvedTasks: prev.solvedTasks,
            }));
            setCurrentTaskId(null);
            await enqueueLoad(false);
            return;
        }

        const hasMore = await ensureMoreTasks();
        if (hasMore) {
            moveToNextTask();
        }
    }, [enqueueLoad, ensureMoreTasks, moveToNextTask]);

    const goToNext = useCallback(() => {
        const snapshot = stateRef.current;
        const currentIndex = clampIndex(snapshot.currentIndex, snapshot.tasks.length);
        const hasNextInBuffer = currentIndex < snapshot.tasks.length - 1;

        if (hasNextInBuffer) {
            moveToNextTask();
            return;
        }

        void handleEndOfQueue();
    }, [handleEndOfQueue, moveToNextTask]);

    const goToPrevious = useCallback(() => {
        let prevTaskId: string | null = null;

        setState(prev => {
            if (prev.tasks.length === 0) {
                return prev;
            }

            const currentIndex = clampIndex(prev.currentIndex, prev.tasks.length);
            const prevIndex = Math.max(currentIndex - 1, 0);
            prevTaskId = prev.tasks[prevIndex]?.id ?? null;

            return {
                ...prev,
                currentIndex: prevIndex,
            };
        });

        setCurrentTaskId(prevTaskId);
    }, []);

    const updateStats = useCallback((status: SolutionStatus) => {
        setState(prev => {
            const isSuccess = status === 'SUCCESS';

            return {
                ...prev,
                stats: {
                    solved: prev.stats.solved + (isSuccess ? 1 : 0),
                    failed: prev.stats.failed + (!isSuccess ? 1 : 0),
                    streak: isSuccess ? prev.stats.streak + 1 : 0,
                },
            };
        });
    }, []);

    useEffect(() => {
        if (initialLoadDoneRef.current) {
            return;
        }
        initialLoadDoneRef.current = true;
        void enqueueLoad(false);
    }, [enqueueLoad]);

    useEffect(() => {
        if (state.tasks.length === 0 || isLoading) {
            return;
        }

        const currentIndex = clampIndex(state.currentIndex, state.tasks.length);
        const remaining = state.tasks.length - 1 - currentIndex;
        if (remaining > PREFETCH_REMAINING) {
            return;
        }

        void enqueueLoad(true);
    }, [state.currentIndex, state.tasks.length, isLoading, enqueueLoad]);

    useEffect(() => {
        if (state.tasks.length === 0) {
            return;
        }

        const index = clampIndex(state.currentIndex, state.tasks.length);
        if (state.tasks[index]) {
            return;
        }

        let nextTaskId: string | null = null;

        setState(prev => {
            const nextIndex = resolveCurrentIndex(
                prev.tasks,
                prev,
                currentTaskIdRef.current
            );
            nextTaskId = prev.tasks[nextIndex]?.id ?? null;

            return {
                ...prev,
                currentIndex: clampIndex(nextIndex, prev.tasks.length),
            };
        });

        setCurrentTaskId(nextTaskId);
    }, [state.tasks, state.currentIndex]);

    const currentIndex = clampIndex(state.currentIndex, state.tasks.length);
    const currentTask = state.tasks[currentIndex] ?? null;
    const isCurrentTaskCompleted = currentTask
        ? isTaskCompleted(currentTask.id, state)
        : false;

    const getCodeForTask = useCallback((taskId: string, langId: string): string => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return getLangById(langId).defaultTemplate;

        const cached = state.codeCache[taskId]?.[langId];
        if (cached) return cached;

        return getLangById(langId).defaultTemplate;
    }, [state.tasks, state.codeCache]);

    const [code, setCode] = useState('');

    useEffect(() => {
        if (!currentTask) return;

        setCode(getCodeForTask(currentTask.id, selectedLanguage));
    }, [currentTask, selectedLanguage, getCodeForTask]);

    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode);

        if (!currentTask) return;

        setState(prev => ({
            ...prev,
            codeCache: {
                ...prev.codeCache,
                [currentTask.id]: {
                    ...prev.codeCache[currentTask.id],
                    [selectedLanguage]: newCode,
                },
            },
        }));
    }, [currentTask, selectedLanguage]);

    const addSubmissionResult = useCallback((taskId: string, result: SubmissionResult) => {
        setState(prev => {
            const currentResults = prev.taskResults[taskId] || [];
            const updatedResults = [result, ...currentResults].slice(0, MAX_RESULTS_PER_TASK);

            return {
                ...prev,
                taskResults: {
                    ...prev.taskResults,
                    [taskId]: updatedResults,
                },
            };
        });
    }, []);

    const markTaskAsSolved = useCallback((taskId: string) => {
        setState(prev => {
            const newSolved = new Set(prev.solvedTasks);
            newSolved.add(taskId);

            return {
                ...prev,
                solvedTasks: newSolved,
            };
        });
    }, []);

    const taskResults = currentTask ? (state.taskResults[currentTask.id] || []) : [];
    const isTaskSolved = currentTask ? state.solvedTasks.has(currentTask.id) : false;
    const canSubmit = currentTask ? !isCurrentTaskCompleted : false;
    const isQueueEmpty = state.tasks.length === 0 && !isLoading;
    const isResolvingTask = state.tasks.length > 0 && !currentTask;

    return {
        tasks: state.tasks,
        currentTask,
        currentIndex,
        totalLoaded: state.tasks.length,

        stats: state.stats,
        updateStats,

        goToNext,
        goToPrevious,
        canGoNext: currentIndex < state.tasks.length - 1,
        canGoPrevious: currentIndex > 0,

        selectedLanguage,
        setSelectedLanguage,
        code,
        setCode: handleCodeChange,

        isLoading: isLoading || isResolvingTask,
        loadMore: async () => {
            await enqueueLoad(true);
        },
        refresh: async () => {
            await enqueueLoad(false);
        },

        isQueueEmpty,
        isLastTask: currentIndex === state.tasks.length - 1,

        taskResults,
        isTaskSolved,
        isCurrentTaskCompleted,
        canSubmit,
        markTaskAsSolved,
        addSubmissionResult,
    };
}
