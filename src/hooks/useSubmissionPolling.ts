import {useCallback, useEffect, useRef, useState} from 'react';
import {type Language, type SolutionRequest, type SolutionStatus} from '@/types/solution';
import {toast} from 'sonner';
import {solutionService} from '@/services/solutionService';
import type {SubmissionResult} from "@/types/queue";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;

interface UseSubmissionReturn {
    submissionStatus: SolutionStatus | null;
    feedback: string;
    isSubmitting: boolean;
    error: string | null;
    submitSolution: (
        taskId: string,
        answer: string,
        languageBackend: Language
    ) => Promise<void>;
    resetSubmission: () => void;
}

interface UseSubmissionPollingProps {
    onSolved?: (taskId: string, solutionId: string) => void;
    onResult?: (taskId: string, result: SubmissionResult) => void;
}

export function useSubmissionPolling({
                                         onSolved,
                                         onResult
                                     }: UseSubmissionPollingProps = {}): UseSubmissionReturn {

    const [submissionStatus, setSubmissionStatus] = useState<SolutionStatus | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const attemptsRef = useRef(0);

    // 🔹 защита от гонок (старые запросы)
    const activeSolutionIdRef = useRef<string | null>(null);

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearTimeout(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        attemptsRef.current = 0;
    }, []);

    const finishSubmission = useCallback((
        status: SolutionStatus,
        feedbackText: string
    ) => {
        stopPolling();
        setSubmissionStatus(status);
        setFeedback(feedbackText);
        setIsSubmitting(false);
    }, [stopPolling]);

    const pollStatus = useCallback(async (
        solutionId: string,
        taskId: string,
        languageBackend: Language
    ) => {
        try {
            // 🔹 игнорируем устаревшие запросы
            if (activeSolutionIdRef.current !== solutionId) return;

            const result = await solutionService.getById(solutionId);

            // 🔹 ещё раз проверка (на случай race после await)
            if (activeSolutionIdRef.current !== solutionId) return;

            if (result.status === 'PENDING') {
                attemptsRef.current += 1;

                if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                    finishSubmission(
                        'TIMEOUT',
                        'Превышено время ожидания ответа от сервера'
                    );
                    toast.error('Таймаут проверки решения');
                    return;
                }

                pollIntervalRef.current = setTimeout(
                    // eslint-disable-next-line react-hooks/immutability
                    () => pollStatus(solutionId, taskId, languageBackend),
                    POLL_INTERVAL_MS
                );
                return;
            }

            // 🔹 финальный результат
            const submissionResult: SubmissionResult = {
                id: solutionId,
                status: result.status,
                feedback: result.feedBack || '',
                language: languageBackend,
                submittedAt: Date.now(),
            };

            onResult?.(taskId, submissionResult);

            finishSubmission(result.status, result.feedBack || '');

            if (result.status === 'SUCCESS') {
                toast.success('Решение принято! 🎉');
                onSolved?.(taskId, solutionId);
            } else if (result.status === 'FAILED') {
                toast.error('Решение не прошло проверку');
            } else {
                toast.warning(`Статус: ${result.status}`);
            }

        } catch {
            finishSubmission(
                'SERVICE_UNAVAILABLE',
                'Ошибка при проверке статуса решения'
            );
            toast.error('Не удалось получить статус решения');
        }
    }, [finishSubmission, onResult, onSolved]);

    const submitSolution = useCallback(async (
        taskId: string,
        answer: string,
        languageBackend: Language
    ) => {
        if (!answer.trim()) {
            toast.warning('Введите код перед отправкой');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSubmissionStatus('PENDING');
        setFeedback('Отправка решения...');
        attemptsRef.current = 0;

        try {
            const request: SolutionRequest = {
                taskId,
                answer,
                language: languageBackend,
            };

            const response = await solutionService.submit(request);

            // 🔹 фиксируем активное решение
            activeSolutionIdRef.current = response.id;

            pollStatus(response.id, taskId, languageBackend);

        } catch {
            finishSubmission(
                'SERVICE_UNAVAILABLE',
                'Не удалось отправить решение'
            );
            setError('Не удалось отправить решение');
            toast.error('Ошибка отправки решения');
        }
    }, [pollStatus, finishSubmission]);

    const resetSubmission = useCallback(() => {
        stopPolling();
        activeSolutionIdRef.current = null;

        setSubmissionStatus(null);
        setFeedback('');
        setError(null);
        setIsSubmitting(false);
    }, [stopPolling]);

    // 🔹 cleanup при размонтировании
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        submissionStatus,
        feedback,
        isSubmitting,
        error,
        submitSolution,
        resetSubmission,
    };
}