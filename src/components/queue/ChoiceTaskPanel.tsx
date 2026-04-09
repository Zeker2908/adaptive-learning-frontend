// components/queue/ChoiceTaskPanel.tsx
import {useCallback, useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {CheckCircle2, Loader2, Send} from 'lucide-react';
import {OptionItem} from './OptionItem';
import {SubmissionStatus} from './SubmissionStatus';
import type {MultipleChoiceTaskContent, SingleChoiceTaskContent, TaskResponse} from '@/types/task';
import type {SubmissionResult} from '@/types/queue';
import {type SolutionStatus} from '@/types/solution';
import {useChoiceSubmission} from "@/hooks/useChoiceSubmission.ts";

interface Props {
    task: TaskResponse;
    isTaskSolved: boolean;
    taskResults: SubmissionResult[];
    onSolved: (taskId: string, status: SolutionStatus) => void;
    onResult: (taskId: string, result: SubmissionResult) => void;
}

export function ChoiceTaskPanel({
                                    task,
                                    isTaskSolved,
                                    taskResults,
                                    onSolved,
                                    onResult
                                }: Props) {
    const content = task.content as SingleChoiceTaskContent | MultipleChoiceTaskContent;
    const isMultiple = content.type === 'MULTIPLE_CHOICE';
    const MAX_ATTEMPTS = 1;

    const failedAttempts = taskResults.filter(r => r.status === 'FAILED').length;
    const isAttemptsExceeded = failedAttempts >= MAX_ATTEMPTS;

    const hasHandledExceededRef = useRef(false);

    const {submissionStatus, feedback, isSubmitting, submitAnswer, resetSubmission} =
        useChoiceSubmission({onSolved, onResult});

    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const hasRestoredRef = useRef(false);

    // 🔹 Сбрасываем флаг при смене задачи
    useEffect(() => {
        hasHandledExceededRef.current = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIndices([]);
    }, [task.id]);

    useEffect(() => {
        resetSubmission();
    }, [task.id, resetSubmission])

    useEffect(() => {
        if (isAttemptsExceeded && !hasHandledExceededRef.current) {
            hasHandledExceededRef.current = true;

            onSolved(task.id, 'FAILED');
        }
    }, [isAttemptsExceeded, onSolved, task.id]);

    // 🔹 Восстанавливаем выбор из истории (только один раз за задачу)
    useEffect(() => {
        // Если уже восстановили или нет истории — выходим
        if (hasRestoredRef.current || taskResults.length === 0) return;

        const lastResult = taskResults[0];
        if (lastResult?.answer) {
            try {
                let parsed: number | number[];
                try {
                    parsed = JSON.parse(lastResult.answer);
                } catch {
                    // Если не JSON, значит просто число строкой "2"
                    parsed = parseInt(lastResult.answer, 10);
                }

                const indices = Array.isArray(parsed) ? parsed : [parsed];

                if (indices.length > 0 && indices.every(n => Number.isInteger(n))) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setSelectedIndices(indices);
                    hasRestoredRef.current = true; // 🔹 Помечаем как восстановленное
                }
            } catch {
                // Игнорируем ошибки парсинга
            }
        }
    }, [taskResults]);

    const handleSelect = useCallback((index: number) => {
        if (isTaskSolved || isSubmitting) return;

        setSelectedIndices(prev => {
            if (isMultiple) {
                return prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index];
            } else {
                return [index];
            }
        });
    }, [isMultiple, isTaskSolved, isSubmitting]);

    const handleSubmit = useCallback(() => {
        if (isAttemptsExceeded) {
            return;
        }

        if (selectedIndices.length === 0) return;
        if (isTaskSolved || isSubmitting) return;

        resetSubmission();
        submitAnswer(task.id, selectedIndices, isMultiple);
    }, [
        task.id,
        selectedIndices,
        isMultiple,
        isTaskSolved,
        isSubmitting,
        resetSubmission,
        submitAnswer,
        isAttemptsExceeded
    ]);

    const isLocked = isTaskSolved || isSubmitting || isAttemptsExceeded;
    const canSubmit = selectedIndices.length > 0 && !isLocked;

    return (
        <div className="flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-medium flex items-center gap-2">
                    {isMultiple ? '🔘 Несколько вариантов' : '🔘 Один вариант'}
                    {isTaskSolved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3"/> Решено
            </span>
                    )}
                </h3>
            </div>

            {/* OPTIONS */}
            <div className="space-y-2 mb-4">
                {content.options.map((option, index) => (
                    <OptionItem
                        key={index}
                        index={index}
                        text={option.text}
                        isSelected={selectedIndices.includes(index)}
                        isMultiple={isMultiple}
                        disabled={isLocked}
                        onSelect={handleSelect}
                    />
                ))}
            </div>


            {/* ACTIONS */}
            <div className="space-y-3 mt-auto">
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : isTaskSolved ? (
                        <CheckCircle2 className="h-4 w-4"/>
                    ) : (
                        <Send className="h-4 w-4"/>
                    )}
                    {isTaskSolved
                        ? 'Задача решена'
                        : isSubmitting
                            ? 'Проверка...'
                            : 'Отправить ответ'}
                </Button>

                <SubmissionStatus
                    status={submissionStatus}
                    feedback={feedback}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}
