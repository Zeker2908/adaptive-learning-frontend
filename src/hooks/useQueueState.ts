// /hooks/useQueueState.ts
import {useCallback, useEffect, useRef, useState} from 'react';
import {recommendationService} from '@/services/recommendationService';
import type {QueueState, SubmissionResult, UseQueueReturn} from '@/types/queue';
import {getLangById, LANGUAGES} from '@/types/languages';
import type {SolutionStatus} from "@/types/solution.ts";
import type {TaskResponse} from '@/types/task';

const STORAGE_KEY = 'infinite_queue_state';
const STORAGE_TTL = 1000 * 60 * 60; // 1 час
const MAX_RESULTS_PER_TASK = 3;
const MAX_ATTEMPTS = 3;
const INITIAL_BATCH_SIZE = 5;
const LOAD_MORE_BATCH_SIZE = 10;
const PREFETCH_REMAINING = 2;

export function clearQueueStorage() {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[Queue] Storage cleared');
    } catch (e) {
        console.warn('[Queue] Failed to clear storage:', e);
    }
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

function serializeState(state: QueueState) {
    return {
        ...state,
        solvedTasks: Array.from(state.solvedTasks),
    };
}

function deserializeState(raw: string): QueueState {
    const parsed = JSON.parse(raw);

    return {
        ...parsed,
        solvedTasks: new Set(parsed.solvedTasks || []),
    };
}

function getTaskById(tasks: TaskResponse[], taskId: string): TaskResponse | undefined {
    return tasks.find(task => task.id === taskId);
}

function isChoiceTask(task: TaskResponse | undefined): boolean {
    const type = task?.content.type;
    return type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE';
}

export function isTaskCompleted(taskId: string, state: QueueState): boolean {
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

export function useQueueState(): UseQueueReturn {
    const [state, setState] = useState<QueueState>(() => loadFromStorage());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
    const stateRef = useRef(state);
    const isLoadingRef = useRef(false);
    const loadGenerationRef = useRef(0);
    const pendingAppendRef = useRef(false);
    const initialLoadDoneRef = useRef(false);
    const skipNextPersistRef = useRef(true);

    stateRef.current = state;

    function loadFromStorage(): QueueState {
        try {
            if (typeof window === 'undefined') return getInitialState();

            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return getInitialState();

            const parsed = deserializeState(raw);

            if (Date.now() - parsed.lastUpdated > STORAGE_TTL) {
                return getInitialState();
            }

            return parsed;
        } catch {
            return getInitialState();
        }
    }

    const saveToStorage = useCallback((newState: QueueState) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    ...serializeState(newState),
                    lastUpdated: Date.now(),
                })
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
        saveToStorage(state);
    }, [state, saveToStorage]);

    const reconcileState = useCallback((prev: QueueState, newTasks: QueueState['tasks'], append: boolean): QueueState => {
        const taskMap = new Map<string, typeof newTasks[number]>();

        if (append) {
            prev.tasks.forEach(t => taskMap.set(t.id, t));
        }

        newTasks.forEach(t => taskMap.set(t.id, t));

        const mergedTasks = Array.from(taskMap.values());
        const taskIds = new Set(mergedTasks.map(t => t.id));

        const filteredSolved = new Set(
            Array.from(prev.solvedTasks).filter(id => taskIds.has(id))
        );

        const filteredResults = Object.fromEntries(
            Object.entries(prev.taskResults).filter(([id]) => taskIds.has(id))
        );

        const filteredCodeCache = Object.fromEntries(
            Object.entries(prev.codeCache).filter(([id]) => taskIds.has(id))
        );

        return {
            ...prev,
            tasks: mergedTasks,
            currentIndex: append ? prev.currentIndex : 0,
            solvedTasks: filteredSolved,
            taskResults: filteredResults,
            codeCache: filteredCodeCache,
            lastUpdated: Date.now(),
        };
    }, []);

    const loadTasks = useCallback(async (append = false): Promise<number> => {
        if (isLoadingRef.current) {
            if (append) {
                pendingAppendRef.current = true;
            }
            return 0;
        }

        isLoadingRef.current = true;
        setIsLoading(true);
        const generation = ++loadGenerationRef.current;

        try {
            const newTasks = await recommendationService.getRecommendations({
                limit: append ? LOAD_MORE_BATCH_SIZE : INITIAL_BATCH_SIZE,
            });

            if (generation !== loadGenerationRef.current) {
                return 0;
            }

            let addedCount = 0;

            setState(prev => {
                const knownIds = new Set(prev.tasks.map(task => task.id));
                const newState = reconcileState(prev, newTasks, append);
                addedCount = newState.tasks.filter(task => !knownIds.has(task.id)).length;
                return newState;
            });

            return addedCount;
        } catch (error) {
            console.error('[Queue] Failed to load:', error);
            return 0;
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);

            if (pendingAppendRef.current) {
                pendingAppendRef.current = false;
                void loadTasks(true);
            }
        }
    }, [reconcileState]);

    const handleEndOfQueue = useCallback(async () => {
        const snapshot = stateRef.current;

        if (isQueueCompleted(snapshot)) {
            setState({
                ...getInitialState(),
                stats: snapshot.stats,
            });
            await loadTasks(false);
            return;
        }

        const added = await loadTasks(true);
        if (added > 0) {
            setState(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1,
            }));
        }
    }, [loadTasks]);

    const goToNext = useCallback(() => {
        const snapshot = stateRef.current;

        if (snapshot.currentIndex < snapshot.tasks.length - 1) {
            setState(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1,
            }));
            return;
        }

        void handleEndOfQueue();
    }, [handleEndOfQueue]);

    const goToPrevious = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentIndex: Math.max(prev.currentIndex - 1, 0),
        }));
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

        const snapshot = stateRef.current;

        if (snapshot.tasks.length === 0) {
            void loadTasks(false);
            return;
        }

        if (isQueueCompleted(snapshot)) {
            void loadTasks(true);
        }
    }, [loadTasks]);

    useEffect(() => {
        if (state.tasks.length === 0 || isLoadingRef.current) {
            return;
        }

        const remaining = state.tasks.length - 1 - state.currentIndex;
        if (remaining > PREFETCH_REMAINING) {
            return;
        }

        void loadTasks(true);
    }, [state.currentIndex, state.tasks.length, loadTasks]);

    const currentTask = state.tasks[state.currentIndex] || null;
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

    return {
        tasks: state.tasks,
        currentTask,
        currentIndex: state.currentIndex,
        totalLoaded: state.tasks.length,

        stats: state.stats,
        updateStats,

        goToNext,
        goToPrevious,
        canGoNext: state.currentIndex < state.tasks.length - 1,
        canGoPrevious: state.currentIndex > 0,

        selectedLanguage,
        setSelectedLanguage,
        code,
        setCode: handleCodeChange,

        isLoading,
        loadMore: async () => {
            await loadTasks(true);
        },
        refresh: async () => {
            await loadTasks(false);
        },

        isQueueEmpty: state.tasks.length === 0,
        isLastTask: state.currentIndex === state.tasks.length - 1,

        taskResults,
        isTaskSolved,
        isCurrentTaskCompleted,
        canSubmit,
        markTaskAsSolved,
        addSubmissionResult,
    };
}
