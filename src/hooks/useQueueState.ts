// hooks/useQueueState.ts
import {useCallback, useEffect, useRef, useState} from 'react';
import {recommendationService} from '@/services/recommendationService';
import {getLangById, LANGUAGES} from '@/config/languages';
import type {QueueState, UseQueueReturn} from "@/config/queue.ts";
import {useError} from "@/hooks/useError.ts";

const STORAGE_KEY = 'infinite_queue_state';
const STORAGE_TTL = 1000 * 60 * 60; // 1 час
const BATCH_SIZE = 5;

export function useQueueState(): UseQueueReturn {
    const [state, setState] = useState<QueueState>(() => loadFromStorage());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
    const {handleError} = useError();

    const pollIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 🔹 Загрузка из localStorage
    function loadFromStorage(): QueueState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return getInitialState();

            const parsed: QueueState = JSON.parse(raw);
            // Проверяем актуальность кэша
            if (Date.now() - parsed.lastUpdated > STORAGE_TTL) {
                return getInitialState();
            }
            return parsed;
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
        };
    }

    // 🔹 Сохранение в localStorage
    const saveToStorage = useCallback((newState: QueueState) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...newState,
                lastUpdated: Date.now(),
            }));
        } catch (e) {
            console.warn('Failed to save queue state:', e);
        }
    }, []);

    // 🔹 Загрузка задач
    const loadTasks = useCallback(async (append = false) => {
        setIsLoading(true);
        try {
            const newTasks = await recommendationService.getRecommendations(BATCH_SIZE);
            // Фильтруем только CODING задачи
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
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError, saveToStorage]);

    // 🔹 Навигация
    const goToNext = useCallback(() => {
        setState(prev => {
            const nextIndex = Math.min(prev.currentIndex + 1, prev.tasks.length - 1);
            // Если дошли до конца — загружаем ещё
            if (nextIndex === prev.tasks.length - 1 && prev.tasks.length >= BATCH_SIZE) {
                loadTasks(true); // append mode
            }
            const newState = {...prev, currentIndex: nextIndex};
            saveToStorage(newState);
            return newState;
        });
    }, [loadTasks, saveToStorage]);

    const goToPrevious = useCallback(() => {
        setState(prev => {
            const prevIndex = Math.max(prev.currentIndex - 1, 0);
            const newState = {...prev, currentIndex: prevIndex};
            saveToStorage(newState);
            return newState;
        });
    }, [saveToStorage]);

    // 🔹 Управление кодом (с кэшированием по taskId + языку)
    const currentTask = state.tasks[state.currentIndex] || null;

    const getCodeForTask = useCallback((taskId: string, langId: string): string => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return getLangById(langId).defaultTemplate;

        // Приоритет: кэш → шаблон из задачи → дефолтный шаблон
        const cached = state.codeCache[taskId]?.[langId];
        if (cached) return cached;

        return getLangById(langId).defaultTemplate;
    }, [state.tasks, state.codeCache]);

    const [code, setCode] = useState('');

    // Синхронизация кода при смене задачи/языка
    useEffect(() => {
        if (!currentTask) return;

        setCode(getCodeForTask(currentTask.id, selectedLanguage));
    }, [currentTask, selectedLanguage, getCodeForTask]);

    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode);
        if (!currentTask) return;

        // Обновляем кэш "лениво" — при изменении
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

    // 🔹 Initial load
    useEffect(() => {
        if (state.tasks.length === 0) {
            loadTasks();
        }
    }, [loadTasks, state.tasks.length]);

    // 🔹 Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

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
    };
}