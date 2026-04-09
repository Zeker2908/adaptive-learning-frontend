import {useCallback, useEffect, useMemo, useRef} from 'react';
import Editor from '@monaco-editor/react';
import {Button} from '@/components/ui/button';
import {CheckCircle2, Loader2, Send} from 'lucide-react';
import {LanguageSelector} from './LanguageSelector';
import {SubmissionStatus} from './SubmissionStatus';
import {getLangById} from '@/types/languages';
import type {TaskResponse} from '@/types/task';
import type {SubmissionResult} from '@/types/queue';
import {useSubmissionPolling} from "@/hooks/useSubmissionPolling";
import {type Language, type SolutionStatus, SolutionStatusLabels} from "@/types/solution";

interface Props {
    task: TaskResponse;
    code: string;
    onCodeChange: (code: string) => void;
    selectedLanguage: string;
    onLanguageChange: (langId: string) => void;
    isTaskSolved: boolean;
    taskResults: SubmissionResult[];
    onSolved: (taskId: string, status: SolutionStatus) => void;
    onResult: (taskId: string, result: SubmissionResult) => void;
}

const MAX_FAILED_ATTEMPTS = 3;

export function CodeEditorPanel({
                                    task,
                                    code,
                                    onCodeChange,
                                    selectedLanguage,
                                    onLanguageChange,
                                    isTaskSolved,
                                    taskResults,
                                    onSolved,
                                    onResult,
                                }: Props) {

    const {
        submissionStatus,
        feedback,
        isSubmitting,
        submitSolution,
        resetSubmission
    } = useSubmissionPolling({ onSolved, onResult });

    const hasHandledExceededRef = useRef(false);

    const failedAttempts = useMemo(() => {
        return taskResults.filter(r => r.status === 'FAILED').length;
    }, [taskResults]);
    const langConfig = useMemo(() => getLangById(selectedLanguage), [selectedLanguage]);

    useEffect(() => {
        hasHandledExceededRef.current = false;
    }, [task.id]);

    useEffect(() => {
        resetSubmission();
    }, [task.id, resetSubmission]);

    useEffect(() => {
        // 🔹 Проверяем: лимит превышен И ещё не обработали для этой задачи
        if (failedAttempts >= MAX_FAILED_ATTEMPTS && !hasHandledExceededRef.current) {
            hasHandledExceededRef.current = true; // 🔹 Блокируем повторные вызовы

            onSolved(task.id, 'FAILED');
        }
    }, [failedAttempts, onSolved, task.id]);

    const isAttemptsExceeded = failedAttempts >= MAX_FAILED_ATTEMPTS;

    const isPending = submissionStatus === 'PENDING';

    const isLocked = isSubmitting || isPending || isTaskSolved || isAttemptsExceeded;

    const handleSubmit = useCallback(() => {
        if (isAttemptsExceeded) {
            return;
        }

        if (!code.trim() || isLocked) return;

        submitSolution(task.id, code, langConfig.backend);
    }, [task.id, code, langConfig.backend, submitSolution, isLocked, isAttemptsExceeded]);

    const handleEditorChange = useCallback((val: string | undefined) => {
        if (!isTaskSolved) {
            onCodeChange(val ?? '');
        }
    }, [onCodeChange, isTaskSolved]);

    return (
        <div className="flex flex-col h-full">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                    💻 Редактор кода

                    {isTaskSolved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3"/>
                            Решено
                        </span>
                    )}
                </h3>

                <LanguageSelector
                    value={selectedLanguage}
                    onChange={onLanguageChange}
                    disabled={isLocked}
                />
            </div>

            {/* EDITOR */}
            <div className="flex-1 border rounded-md overflow-hidden mb-4 relative min-h-[400px]">

                {isTaskSolved && (
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center p-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2"/>
                            <p className="font-medium text-green-700">Задача уже решена!</p>
                            <p className="text-sm text-muted-foreground">
                                Переходите к следующей задаче
                            </p>
                        </div>
                    </div>
                )}

                <Editor
                    height="100%"
                    language={langConfig.monaco}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: {enabled: false},
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: {top: 12},
                        tabSize: 4,
                        readOnly: isTaskSolved,
                    }}
                />
            </div>

            {isAttemptsExceeded ? (
                <p className="text-xs text-red-500">
                    Достигнут лимит попыток
                </p>
            ) : (
                <div className="flex gap-1 mb-2">
                    {Array.from({ length: MAX_FAILED_ATTEMPTS }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                                i < failedAttempts ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            )}

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
                                        {getLangById(result.language as Language)?.label || result.language}
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
                <Button
                    onClick={handleSubmit}
                    disabled={isLocked || !code.trim()}
                    className="w-full gap-2"
                >
                    {isSubmitting || isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : isTaskSolved ? (
                        <CheckCircle2 className="h-4 w-4"/>
                    ) : (
                        <Send className="h-4 w-4"/>
                    )}

                    {isTaskSolved
                        ? 'Задача решена'
                        : isSubmitting || isPending
                            ? 'Проверка...'
                            : 'Отправить решение'}
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
