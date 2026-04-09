// hooks/useChoiceSubmission.ts
import { useState, useCallback } from 'react';
import { type SolutionRequest, type SolutionStatus } from '@/types/solution';
import { toast } from 'sonner';
import type { SubmissionResult } from '@/types/queue';
import { solutionService } from "@/services/solutionService.ts";

interface UseChoiceSubmissionReturn {
    submissionStatus: SolutionStatus | null;
    feedback: string;
    isSubmitting: boolean;
    // 🔹 FIX: Принимаем number[] — это типобезопаснее
    submitAnswer: (taskId: string, answerIndices: number[], isMultiple: boolean) => Promise<void>;
    resetSubmission: () => void;
}

interface UseChoiceSubmissionProps {
    onSolved?: (taskId: string, status: SolutionStatus) => void;
    onResult?: (taskId: string, result: SubmissionResult) => void;
}

export function useChoiceSubmission({
                                        onSolved,
                                        onResult
                                    }: UseChoiceSubmissionProps = {}): UseChoiceSubmissionReturn {

    const [submissionStatus, setSubmissionStatus] = useState<SolutionStatus | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAnswer = useCallback(async (
        taskId: string,
        answerIndices: number[],
        isMultiple: boolean
    ) => {
        if (answerIndices.length === 0) {
            toast.warning('Выберите вариант ответа');
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus('PENDING');
        setFeedback('Проверка...');

        try {
            // 🔹 Формируем payload: "2" для single, "[0,2]" для multiple
            const answerPayload = isMultiple
                ? JSON.stringify(answerIndices)
                : String(answerIndices[0]);

            const request: SolutionRequest = {
                taskId,
                answer: answerPayload,
                // 🔹 language не передаём для choice-задач
            };

            const result = await solutionService.submit(request);

            const submissionResult: SubmissionResult = {
                id: result.id,
                status: result.status,
                feedback: result.feedBack || '',
                answer: answerPayload,
                submittedAt: Date.now(),
            };

            onResult?.(taskId, submissionResult);
            setSubmissionStatus(result.status);
            setFeedback(result.feedBack || '');

            if (result.status === 'SUCCESS') {
                onSolved?.(taskId, result.status);
            }

        } catch {
            setSubmissionStatus('SERVICE_UNAVAILABLE');
            setFeedback('Ошибка отправки ответа');
            toast.error('Не удалось отправить ответ');
        } finally {
            setIsSubmitting(false);
        }
    }, [onSolved, onResult]);

    const resetSubmission = useCallback(() => {
        setSubmissionStatus(null);
        setFeedback('');
        setIsSubmitting(false);
    }, []);

    return {
        submissionStatus,
        feedback,
        isSubmitting,
        submitAnswer,
        resetSubmission,
    };
}
