// components/queue/hooks/useQueueState.ts
import {useCallback, useEffect, useState} from 'react';
import {recommendationService} from '@/services/recommendationService';
import type {QueueState, SubmissionResult, UseQueueReturn} from '@/types/queue';
import {getLangById, LANGUAGES} from '@/types/languages';

const STORAGE_KEY = 'infinite_queue_state';
const STORAGE_TTL = 1000 * 60 * 60; // 1 час
const BATCH_SIZE = 5;
const MAX_RESULTS_PER_TASK = 5;

export function useQueueState(): UseQueueReturn {
    const [state, setState] = useState<QueueState>(() => loadFromStorage());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);

    function loadFromStorage(): QueueState {
        try {
            if (typeof window === 'undefined') {
                return getInitialState();
            }

            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return getInitialState();

            const parsed: QueueState = JSON.parse(raw);

            if (Date.now() - parsed.lastUpdated > STORAGE_TTL) {
                return getInitialState();
            }

            return {
                ...parsed,
                solvedTasks: new Set(parsed.solvedTasks || []),
            };
        } catch {
            return getInitialState();
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
        };
    }

    const saveToStorage = useCallback((newState: QueueState) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...newState,
                lastUpdated: Date.now(),
                // 🔹 Сериализуем Set как массив
                solvedTasks: Array.from(newState.solvedTasks),
            }));
        } catch (e) {
            console.warn('Failed to save queue state:', e);
        }
    }, []);

    const loadTasks = useCallback(async (append = false) => {
        setIsLoading(true);
        try {
            const newTasks = await recommendationService.getRecommendations(BATCH_SIZE);
            const codingTasks = newTasks.filter(t => t.content.type === 'CODING');

            setState(prev => {
                const tasks = append ? [...prev.tasks, ...codingTasks] : codingTasks;
                const newState: QueueState = {
                    ...prev,
                    tasks,
                    currentIndex: append ? prev.currentIndex : 0,
                    lastUpdated: Date.now(),
                };
                saveToStorage(newState);
                return newState;
            });
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [saveToStorage]);

    const goToNext = useCallback(() => {
        setState(prev => {
            const nextIndex = Math.min(prev.currentIndex + 1, prev.tasks.length - 1);
            const newState = { ...prev, currentIndex: nextIndex };
            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    const goToPrevious = useCallback(() => {
        setState(prev => {
            const prevIndex = Math.max(prev.currentIndex - 1, 0);
            const newState = {...prev, currentIndex: prevIndex};
            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    useEffect(() => {
        if (
            state.tasks.length > 0 &&
            state.currentIndex >= state.tasks.length - 1 &&
            !isLoading
        ) {
            loadTasks(true);
        }
    }, [state.currentIndex, state.tasks.length, isLoading, loadTasks]);

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

    // 🔹 Добавить результат решения
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

    // 🔹 Пометить задачу как решённую
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

    // 🔹 Вычисляемые значения для текущей задачи
    const taskResults = currentTask ? (state.taskResults[currentTask.id] || []) : [];
    const isTaskSolved = currentTask ? state.solvedTasks.has(currentTask.id) : false;
    const canSubmit = currentTask ? !isTaskSolved : false;

    useEffect(() => {
        if (state.tasks.length === 0) {
            loadTasks();
        }
    }, [loadTasks, state.tasks.length]);

    return {
        tasks: state.tasks,
        currentTask,
        currentIndex: state.currentIndex,
        totalLoaded: state.tasks.length,

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

        // 🔹 Результаты и блокировка
        taskResults,
        isTaskSolved,
        canSubmit,
        markTaskAsSolved,
        addSubmissionResult,
    };
}