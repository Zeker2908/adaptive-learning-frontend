// components/queue/CodeEditorPanel.tsx
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { SubmissionStatus } from './SubmissionStatus';
import { getLangById } from '@/config/languages';
import type { TaskResponse } from '@/types/task';
import {useSubmissionPolling} from "@/hooks/useSubmissionPolling.ts";

interface Props {
    task: TaskResponse;
    code: string;
    onCodeChange: (code: string) => void;
    selectedLanguage: string;
    onLanguageChange: (langId: string) => void;
}

export function CodeEditorPanel({
                                    task,
                                    code,
                                    onCodeChange,
                                    selectedLanguage,
                                    onLanguageChange
                                }: Props) {
    const {
        submissionStatus,
        feedback,
        isSubmitting,
        submitSolution,
        resetSubmission
    } = useSubmissionPolling();

    const langConfig = getLangById(selectedLanguage);

    const handleSubmit = () => {
        resetSubmission();
        submitSolution(task.id, code, langConfig.backend);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                    💻 Редактор кода
                </h3>
                <LanguageSelector
                    value={selectedLanguage}
                    onChange={onLanguageChange}
                    disabled={isSubmitting || submissionStatus === 'PENDING'}
                />
            </div>

            <div className="flex-1 border rounded-md overflow-hidden mb-4">
                <Editor
                    height="100%"
                    language={langConfig.monaco}
                    value={code}
                    onChange={(val) => onCodeChange(val || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                        tabSize: 4,
                    }}
                />
            </div>

            <div className="space-y-3">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || submissionStatus === 'PENDING' || !code.trim()}
                    className="w-full gap-2"
                >
                    {(isSubmitting || submissionStatus === 'PENDING') ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    {(isSubmitting || submissionStatus === 'PENDING') ? 'Проверка...' : 'Отправить решение'}
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