// pages/DashboardPage.tsx
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useUserStore} from '@/store/userStore';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import type {DailyActivityResponse, UserProgressResponse,} from '@/types/solution';

import {DashboardHeader} from '@/components/dashboard/DashboardHeader';
import {UserInfoCard} from '@/components/dashboard/UserInfoCard';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';
import {RootLayout} from "@/components/layout/RootLayout.tsx";

export default function DashboardPage() {
    const navigate = useNavigate();
    const {handleError} = useError();
    const {user} = useUserStore();

    const [isLoading, setIsLoading] = useState(true);
    const [activity, setActivity] = useState<DailyActivityResponse[]>([]);

    const [progressError, setProgressError] = useState(false);
    const [progress, setProgress] = useState<UserProgressResponse[]>([]);
    const [progressPage, setProgressPage] = useState(0);
    const [progressLast, setProgressLast] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const activityData = await solutionService.getDailyActivities();
                setActivity(activityData);
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
            </div>
        );
    }

    return (
        <RootLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <DashboardHeader firstName={user?.firstName}/>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <UserInfoCard user={user} onEdit={() => navigate('/profile')}/>
                    <ProgressCard
                        data={progress}
                        isLoading={progressLoading}
                        isLast={progressLast}
                        hasError={progressError}
                        onLoadMore={loadMoreProgress}
                        onRetry={retryLoadProgress}
                    />
                    <ActivityChartCard data={activity}/>
                </div>
            </div>
        </RootLayout>
    );
}
