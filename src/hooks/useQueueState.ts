// /hooks/useQueueState.ts
import {useCallback, useEffect, useState} from 'react';
import {recommendationService} from '@/services/recommendationService';
import type {QueueState, SubmissionResult, UseQueueReturn} from '@/types/queue';
import {getLangById, LANGUAGES} from '@/types/languages';
import type {SolutionStatus} from "@/types/solution.ts";

const STORAGE_KEY = 'infinite_queue_state';
const STORAGE_TTL = 1000 * 60 * 60; // 1 час
const MAX_RESULTS_PER_TASK = 3;
const MAX_ATTEMPTS = 3;

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

function isTaskCompleted(taskId: string, state: QueueState): boolean {
    const isSolved = state.solvedTasks.has(taskId);
    const attempts = state.taskResults[taskId]?.length || 0;

    return isSolved || attempts >= MAX_ATTEMPTS;
}

function isQueueCompleted(state: QueueState): boolean {
    if (state.tasks.length === 0) return false;

    return state.tasks.every(task => isTaskCompleted(task.id, state));
}

export function useQueueState(): UseQueueReturn {
    const [state, setState] = useState<QueueState>(() => loadFromStorage());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);

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


    const reconcileState = useCallback((prev: QueueState, newTasks: QueueState['tasks'], append: boolean): QueueState => {
        // 1. Merge задач без дублей
        const taskMap = new Map<string, typeof newTasks[number]>();

        if (append) {
            prev.tasks.forEach(t => taskMap.set(t.id, t));
        }

        newTasks.forEach(t => taskMap.set(t.id, t));

        const mergedTasks = Array.from(taskMap.values());

        // 2. Фильтрация solvedTasks
        const taskIds = new Set(mergedTasks.map(t => t.id));

        const filteredSolved = new Set(
            Array.from(prev.solvedTasks).filter(id => taskIds.has(id))
        );

        return {
            ...prev,
            tasks: mergedTasks,
            currentIndex: append ? prev.currentIndex : 0,
            solvedTasks: filteredSolved,
            lastUpdated: Date.now(),
        };
    }, []);

    const loadTasks = useCallback(async (append = false) => {
        setIsLoading(true);

        try {
            const newTasks = await recommendationService.getRecommendations();

            setState(prev => {
                const newState = reconcileState(prev, newTasks, append);

                saveToStorage(newState);
                return newState;
            });
        } catch (error) {
            console.error('[Queue] Failed to load:', error);
        } finally {
            setIsLoading(false);
        }
    }, [reconcileState, saveToStorage]);

    const goToNext = useCallback(() => {
        setState(prev => {
            const nextIndex = Math.min(prev.currentIndex + 1, prev.tasks.length - 1);

            const tempState = { ...prev, currentIndex: nextIndex };

            if (isQueueCompleted(tempState)) {
                console.log('[Queue] Completed → reset before next load');

                const newState = getInitialState();
                saveToStorage(newState);

                Promise.resolve().then(() => loadTasks());

                return newState;
            }

            saveToStorage(tempState);
            return tempState;
        });
    }, [saveToStorage, loadTasks]);

    const goToPrevious = useCallback(() => {
        setState(prev => {
            const prevIndex = Math.max(prev.currentIndex - 1, 0);
            const newState = {...prev, currentIndex: prevIndex};
            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    const updateStats = useCallback((status: SolutionStatus) => {
        setState(prev => {
            const isSuccess = status === 'SUCCESS';

            const newState = {
                ...prev,
                stats: {
                    solved: prev.stats.solved + (isSuccess ? 1 : 0),
                    failed: prev.stats.failed + (!isSuccess ? 1 : 0),
                    streak: isSuccess ? prev.stats.streak + 1 : 0,
                },
            };

            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    useEffect(() => {
        if (state.tasks.length === 0) {
            loadTasks();
        }
    }, [loadTasks, state.tasks.length]);

    const currentTask = state.tasks[state.currentIndex] || null;

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

        setState(prev => {
            const updated = {
                ...prev,
                codeCache: {
                    ...prev.codeCache,
                    [currentTask.id]: {
                        ...prev.codeCache[currentTask.id],
                        [selectedLanguage]: newCode,
                    },
                },
            };

            saveToStorage(updated);
            return updated;
        });
    }, [currentTask, selectedLanguage, saveToStorage]);

    const addSubmissionResult = useCallback((taskId: string, result: SubmissionResult) => {
        setState(prev => {
            const currentResults = prev.taskResults[taskId] || [];
            const updatedResults = [result, ...currentResults].slice(0, MAX_RESULTS_PER_TASK);

            const newState: QueueState = {
                ...prev,
                taskResults: {
                    ...prev.taskResults,
                    [taskId]: updatedResults,
                },
            };

            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    const markTaskAsSolved = useCallback((taskId: string) => {
        setState(prev => {
            const newSolved = new Set(prev.solvedTasks);
            newSolved.add(taskId);

            const newState: QueueState = {
                ...prev,
                solvedTasks: newSolved,
            };

            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    const taskResults = currentTask ? (state.taskResults[currentTask.id] || []) : [];
    const isTaskSolved = currentTask ? state.solvedTasks.has(currentTask.id) : false;
    const canSubmit = currentTask ? !isTaskSolved : false;

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
        loadMore: () => loadTasks(true),
        refresh: () => loadTasks(),

        isQueueEmpty: state.tasks.length === 0,
        isLastTask: state.currentIndex === state.tasks.length - 1,

        taskResults,
        isTaskSolved,
        canSubmit,
        markTaskAsSolved,
        addSubmissionResult,
    };
}
