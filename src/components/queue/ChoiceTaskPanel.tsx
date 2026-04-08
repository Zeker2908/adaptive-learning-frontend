// components/queue/ChoiceTaskPanel.tsx
import {useCallback, useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {CheckCircle2, Loader2, Send} from 'lucide-react';
import {OptionItem} from './OptionItem';
import {SubmissionStatus} from './SubmissionStatus';
import type {MultipleChoiceTaskContent, SingleChoiceTaskContent, TaskResponse} from '@/types/task';
import type {SubmissionResult} from '@/types/queue';
import {SolutionStatusLabels} from '@/types/solution';
import {useChoiceSubmission} from "@/hooks/useChoiceSubmission.ts";

interface Props {
    task: TaskResponse;
    isTaskSolved: boolean;
    taskResults: SubmissionResult[];
    onSolved: (taskId: string, solutionId: string) => void;
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

    const {submissionStatus, feedback, isSubmitting, submitAnswer, resetSubmission} =
        useChoiceSubmission({onSolved, onResult});

    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    // 🔹 FIX: Ref для отслеживания, восстановили ли мы уже выбор для текущей задачи
    const hasRestoredRef = useRef(false);

    // 🔹 Сбрасываем флаг при смене задачи
    useEffect(() => {
        hasRestoredRef.current = false;
        setSelectedIndices([]); // 🔹 Очищаем выбор при новой задаче
    }, [task.id]);

    useEffect(() => {
        resetSubmission();
    }, [task.id, resetSubmission])

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
                    setSelectedIndices(indices);
                    hasRestoredRef.current = true; // 🔹 Помечаем как восстановленное
                }
            } catch {
                // Игнорируем ошибки парсинга
            }
        }
    }, [taskResults]); // 🔹 Убрали selectedIndices.length из зависимостей

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
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                    {isMultiple ? '🔘 Несколько вариантов' : '🔘 Один вариант'}
                    {isTaskSolved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3"/> Решено
            </span>
                    )}
                </h3>
            </div>

            {/* QUESTION */}
            <div className="mb-4 p-4 bg-muted/30 rounded-md border">
                <p className="text-sm leading-relaxed">{content.question}</p>
            </div>

            {/* OPTIONS */}
            <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-75">
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

            {/* HISTORY */}
            {taskResults.length > 0 && (
                <div className="mb-4 p-3 bg-muted/30 rounded-md border">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                        Последние попытки ({taskResults.length})
                    </div>
                    <div className="space-y-2">
                        {taskResults.map((result) => (
                            <div
                                key={result.id}
                                className="flex items-center justify-between text-xs p-2 bg-background rounded border"
                            >
                                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                      result.status === 'SUCCESS' ? 'bg-green-500' :
                          result.status === 'FAILED' ? 'bg-red-500' :
                              'bg-yellow-500'
                  }`}/>
                                    <span>{SolutionStatusLabels[result.status]}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">
                    {isMultiple ? 'Несколько' : 'Один'} вариант
                  </span>
                                </div>
                                <span className="text-muted-foreground">
                  {new Date(result.submittedAt)
                      .toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* ACTIONS */}
            <div className="space-y-3">
                {isAttemptsExceeded && (
                    <p className="text-xs text-red-500">
                        Достигнут лимит попыток
                    </p>
                )}
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
