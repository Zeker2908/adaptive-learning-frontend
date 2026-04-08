// pages/InfiniteQueuePage.tsx
import { RootLayout } from '@/components/layout/RootLayout';
import { Card } from '@/components/ui/card';
import { TaskDescription } from '@/components/queue/TaskDescription';
import { CodeEditorPanel } from '@/components/queue/CodeEditorPanel';
import { TaskNavigator } from '@/components/queue/TaskNavigator';
import { Loader2, Infinity } from 'lucide-react';
import {useQueueState} from "@/hooks/useQueueState.ts";

export default function InfiniteQueuePage() {
    const {
        currentTask,
        currentIndex,
        totalLoaded,
        goToNext,
        goToPrevious,
        canGoNext,
        canGoPrevious,
        selectedLanguage,
        setSelectedLanguage,
        code,
        setCode,
        isLoading,
        isQueueEmpty,
    } = useQueueState();

    if (isLoading && isQueueEmpty) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground">Загружаем персональные задачи...</p>
                    </div>
                </div>
            </RootLayout>
        );
    }

    if (isQueueEmpty) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="p-8 text-center max-w-md">
                        <Infinity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Очередь пуста</h2>
                        <p className="text-muted-foreground">
                            Пока нет доступных задач. Попробуйте позже или пройдите другие разделы.
                        </p>
                    </Card>
                </div>
            </RootLayout>
        );
    }

    return (
        <RootLayout>
            <div className="max-w-7xl mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Infinity className="h-6 w-6 text-primary" />
                            Бесконечная очередь
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Решайте задачи по мере сил — система подберёт следующие
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Загружено: {totalLoaded} задач
                    </div>
                </div>

                {/* Navigation */}
                <TaskNavigator
                    currentIndex={currentIndex}
                    totalTasks={totalLoaded}
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                    canPrevious={canGoPrevious}
                    canNext={canGoNext}
                />

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                    {/* Left: Task description */}
                    <div className="space-y-4">
                        {currentTask && <TaskDescription task={currentTask} />}
                    </div>

                    {/* Right: Code editor */}
                    <Card className="p-4">
                        {currentTask && (
                            <CodeEditorPanel
                                task={currentTask}
                                code={code}
                                onCodeChange={setCode}
                                selectedLanguage={selectedLanguage}
                                onLanguageChange={setSelectedLanguage}
                            />
                        )}
                    </Card>
                </div>
            </div>
        </RootLayout>
    );
}