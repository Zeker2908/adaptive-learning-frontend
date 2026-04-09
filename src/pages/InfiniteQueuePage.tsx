// pages/InfiniteQueuePage.tsx
import {RootLayout} from '@/components/layout/RootLayout';
import {Card} from '@/components/ui/card';
import {TaskDescription} from '@/components/queue/TaskDescription';
import {CodeEditorPanel} from '@/components/queue/CodeEditorPanel';
import {ChoiceTaskPanel} from '@/components/queue/ChoiceTaskPanel'; // 🔹 Новый импорт
import {CheckCircle2, Infinity as InfinityIcon, Loader2} from 'lucide-react';
import {useQueueState} from "@/hooks/useQueueState";
import {useCallback, useEffect, useRef, useState} from "react";
import type {SolutionStatus} from "@/types/solution.ts";
import {StatBadge} from "@/components/queue/StatBadge.tsx";
import {CountdownToast} from "@/components/queue/CountdownToast.tsx";
import {AnimatePresence, motion} from "framer-motion";

export default function InfiniteQueuePage() {

    const {
        currentTask,
        goToNext,
        updateStats,
        stats,
        selectedLanguage,
        setSelectedLanguage,
        code,
        setCode,
        isLoading,
        isQueueEmpty,
        taskResults,
        isTaskSolved,
        markTaskAsSolved,
        addSubmissionResult,
    } = useQueueState();


    const [countdown, setCountdown] = useState<number | null>(null);
    const handledTasksRef = useRef<Set<string>>(new Set());

    const startAutoNext = useCallback(() => {
        let time = 3;
        setCountdown(time);

        const interval = setInterval(() => {
            time -= 1;
            setCountdown(time);

            if (time === 0) {
                clearInterval(interval);
                setCountdown(null);
                goToNext();
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        }, 1000);
    }, [goToNext, setCountdown]);

    const handleTaskFinished = useCallback((taskId: string, status: SolutionStatus) => {
        // 🔹 Игнорируем повторные вызовы для той же задачи
        if (handledTasksRef.current.has(taskId)) return;
        handledTasksRef.current.add(taskId);

        if (status === 'SUCCESS') {
            markTaskAsSolved(taskId);
        }
        updateStats(status);
        startAutoNext();
    }, [markTaskAsSolved, startAutoNext, updateStats]);

    useEffect(() => {
        if (currentTask) {
            const isAlreadyCompleted = isTaskSolved ||
                taskResults.some(r => r.status === 'FAILED');

            if (!isAlreadyCompleted) {
                handledTasksRef.current.delete(currentTask.id);
            }
        }
    }, [currentTask, isTaskSolved, taskResults]);

    if (isLoading && isQueueEmpty) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
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
                        <InfinityIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
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
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTask?.id}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.2}}
                >
                    {currentTask && (
                        <div className="max-w-7xl mx-auto p-4 space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Заголовок */}
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                        <InfinityIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary"/>
                                        Персональная очередь задач
                                    </h1>
                                    <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                                        Решайте задачи по мере сил — система подберёт следующие
                                    </p>
                                </div>

                                {/* Статистика — компактная на мобильных, полная на десктопе */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    {/* 🔹 Серия — с анимацией появления */}
                                    <AnimatePresence>
                                        {stats.streak > 0 && (
                                            <StatBadge
                                                key="streak"
                                                icon={
                                                    <motion.span
                                                        className="text-sm leading-none inline-flex items-center justify-center"
                                                        animate={{ scale: [1, 1.15, 1], y: [0, -1, 0] }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                                    >
                                                        🔥
                                                    </motion.span>
                                                }
                                                label="Серия"
                                                value={stats.streak}
                                                variant="warning"
                                                animatePresence
                                                compact={true} // 🔹 Компактный режим на мобильных
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* ✅ Решено */}
                                    <StatBadge
                                        icon={<CheckCircle2 className="h-3.5 w-3.5"/>}
                                        label="Решено"
                                        value={stats.solved}
                                        variant="success"
                                        compact={true}
                                    />

                                    {/* ❌ Провалено */}
                                    <StatBadge
                                        icon={<span className="text-sm leading-none">✕</span>}
                                        label="Провалено"
                                        value={stats.failed}
                                        variant="error"
                                        compact={true}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center min-h-8">
                                <CountdownToast countdown={countdown ?? 0} />
                            </div>

                            {/* Main content grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Task description */}
                                <div className="space-y-4">
                                    {currentTask && <TaskDescription task={currentTask}/>}
                                </div>

                                {/* Right: Task panel (conditional) */}
                                <Card className="p-4 flex flex-col">
                                    {currentTask && (
                                        <>
                                            {/* 🔹 CODING задачи */}
                                            {currentTask.content.type === 'CODING' && (
                                                <CodeEditorPanel
                                                    task={currentTask}
                                                    code={code}
                                                    onCodeChange={setCode}
                                                    selectedLanguage={selectedLanguage}
                                                    onLanguageChange={setSelectedLanguage}
                                                    isTaskSolved={isTaskSolved}
                                                    taskResults={taskResults}
                                                    onSolved={handleTaskFinished}
                                                    onResult={addSubmissionResult}
                                                />
                                            )}

                                            {/* 🔹 CHOICE задачи (одиночный или множественный выбор) */}
                                            {(currentTask.content.type === 'SINGLE_CHOICE' ||
                                                currentTask.content.type === 'MULTIPLE_CHOICE') && (
                                                <ChoiceTaskPanel
                                                    task={currentTask}
                                                    isTaskSolved={isTaskSolved}
                                                    taskResults={taskResults}
                                                    onSolved={handleTaskFinished}
                                                    onResult={addSubmissionResult}
                                                />
                                            )}
                                        </>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </RootLayout>
    );
}
