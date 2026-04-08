// hooks/useSubmissionPolling.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { type SolutionRequest, type SolutionStatus } from '@/types/solution';
import { toast } from 'sonner';
import { solutionService } from '@/services/solutionService';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // 60 секунд максимум

interface UseSubmissionReturn {
    submissionStatus: SolutionStatus | null;
    feedback: string;
    isSubmitting: boolean;
    error: string | null;
    submitSolution: (
        taskId: string,
        answer: string,
        languageBackend: string
    ) => Promise<void>;
    resetSubmission: () => void;
}

export function useSubmissionPolling(): UseSubmissionReturn {
    const [submissionStatus, setSubmissionStatus] = useState<SolutionStatus | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const attemptsRef = useRef(0);

    const clearPolling = useCallback(() => {
        if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    }, []);

    const pollStatus = useCallback(async (solutionId: string) => {
        try {
            const result = await solutionService.getById(solutionId);

            setSubmissionStatus(result.status);
            setFeedback(result.feedBack || '');

            if (result.status === 'PENDING') {
                attemptsRef.current += 1;

                if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                    setSubmissionStatus('TIMEOUT');
                    setFeedback('Превышено время ожидания ответа от сервера');
                    toast.error('Таймаут проверки решения');
                    return;
                }

                pollTimeoutRef.current = setTimeout(() => {
                    pollStatus(solutionId);
                }, POLL_INTERVAL_MS);
            } else {
                if (result.status === 'SUCCESS') {
                    toast.success('Решение принято! 🎉');
                } else if (result.status === 'FAILED') {
                    toast.error('Решение не прошло проверку');
                } else {
                    toast.warning(`Статус: ${result.status}`);
                }

                clearPolling();
                attemptsRef.current = 0;
                setIsSubmitting(false);
            }
        } catch {
            setError('Ошибка при проверке статуса решения');
            setSubmissionStatus('SERVICE_UNAVAILABLE');
            toast.error('Не удалось получить статус решения');
            clearPolling();
            setIsSubmitting(false);
        }
    }, [clearPolling]);

    const submitSolution = useCallback(async (
        taskId: string,
        answer: string,
        languageBackend: string
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

            pollStatus(response.id);
        } catch {
            setError('Не удалось отправить решение');
            setSubmissionStatus('SERVICE_UNAVAILABLE');
            toast.error('Ошибка отправки решения');
            setIsSubmitting(false);
        }
    }, [pollStatus]);

    const resetSubmission = useCallback(() => {
        clearPolling();
        setSubmissionStatus(null);
        setFeedback('');
        setError(null);
        setIsSubmitting(false);
        attemptsRef.current = 0;
    }, [clearPolling]);

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, [clearPolling]);

    return {
        submissionStatus,
        feedback,
        isSubmitting,
        error,
        submitSolution,
        resetSubmission,
    };
}
