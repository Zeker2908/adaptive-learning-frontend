// pages/DashboardPage.tsx
import {useCallback, useEffect, useState} from 'react';
import {useUserStore} from '@/store/userStore';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import type {DailyActivityResponse, TaskStatisticsResponse, UserProgressResponse,} from '@/types/solution';

import {DashboardHeader} from '@/components/dashboard/DashboardHeader';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';
import {RootLayout} from "@/components/layout/RootLayout.tsx";
import {UserStatisticsCard} from "@/components/dashboard/UserStatisticsCard.tsx";

// 🔹 Импорт анимаций
import {motion} from 'framer-motion';

export default function DashboardPage() {
    const {handleError} = useError();
    const {user} = useUserStore();

    const [, setIsLoading] = useState(true);
    const [activity, setActivity] = useState<DailyActivityResponse[]>([]);

    const [progressError, setProgressError] = useState(false);
    const [progress, setProgress] = useState<UserProgressResponse[]>([]);
    const [progressPage, setProgressPage] = useState(0);
    const [progressLast, setProgressLast] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);
    const [statistics, setStatistics] =
        useState<TaskStatisticsResponse | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const activityData = await solutionService.getDailyActivities();
                const statisticData = await solutionService.getUserStatistics();
                setActivity(activityData);
                setStatistics(statisticData);
            } catch (e) {
                handleError(e);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [handleError]);

    const loadMoreProgress = useCallback(async () => {
        if (progressLoading || progressLast) return;

        try {
            setProgressLoading(true);
            setProgressError(false);

            const page = await solutionService.getUserProgress(progressPage);

            setProgress(prev => [...prev, ...page.content]);
            setProgressLast(page.last);
            setProgressPage(prev => prev + 1);
        } catch (e) {
            handleError(e);
            setProgressError(true);
        } finally {
            setProgressLoading(false);
        }
    }, [progressLoading, progressLast, progressPage, handleError]);

    const retryLoadProgress = useCallback(() => {
        setProgressError(false);
        loadMoreProgress();
    }, [loadMoreProgress]);

    return (
        <RootLayout>
            {/* 🔹 Простая анимация: просто fade-in для всего контейнера */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.3}}
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* Header — без motion, чтобы точно отобразился */}
                <DashboardHeader firstName={user?.firstName}/>

                {/* Grid карточек */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* UserStatisticsCard */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.25, delay: 0.1}}
                        className="lg:col-span-2"
                    >
                        <UserStatisticsCard statistics={statistics} className="h-full"/>
                    </motion.div>

                    {/* ProgressCard */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.25, delay: 0.2}}
                    >
                        <ProgressCard
                            data={progress}
                            isLoading={progressLoading}
                            isLast={progressLast}
                            hasError={progressError}
                            onLoadMore={loadMoreProgress}
                            onRetry={retryLoadProgress}
                        />
                    </motion.div>

                    {/* ActivityChartCard */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.25, delay: 0.3}}
                        className="md:col-span-2 lg:col-span-3"
                    >
                        <ActivityChartCard data={activity}/>
                    </motion.div>
                </div>
            </motion.div>
        </RootLayout>
    );
}
