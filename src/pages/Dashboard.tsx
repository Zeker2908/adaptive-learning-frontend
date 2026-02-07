// pages/DashboardPage.tsx
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {userService} from '@/services/userService';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import {useAuthStore} from '@/store/authStore';
import type {UserResponse} from '@/types/user';
import type {DailyActivityResponse, UserProgressResponse,} from '@/types/solution';

import {DashboardHeader} from '@/components/dashboard/DashboardHeader';
import {UserInfoCard} from '@/components/dashboard/UserInfoCard';
import {QuickActionsCard} from '@/components/dashboard/QuickActionsCard';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';

export default function DashboardPage() {
    const navigate = useNavigate();
    const {logout, logoutAll} = useAuthStore();
    const {handleError} = useError();

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [activity, setActivity] = useState<DailyActivityResponse[]>([]);

    const [progress, setProgress] = useState<UserProgressResponse[]>([]);
    const [progressPage, setProgressPage] = useState(0);
    const [progressLast, setProgressLast] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const userData = await userService.currentUser();
                const activityData = await solutionService.getDailyActivities();
                setUser(userData);
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

            const page = await solutionService.getUserProgress(progressPage);

            setProgress(prev => [...prev, ...page.content]);
            setProgressLast(page.last);
            setProgressPage(prev => prev + 1);
        } catch (e) {
            handleError(e);
        } finally {
            setProgressLoading(false);
        }
    }, [progressLoading, progressLast, progressPage, handleError]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <DashboardHeader firstName={user?.firstName}/>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <UserInfoCard user={user} onEdit={() => navigate('/profile')}/>
                    <QuickActionsCard
                        onSettings={() => navigate('/settings')}
                        onLogout={logout}
                        onLogoutAll={logoutAll}
                    />
                    <ActivityChartCard data={activity}/>
                    <ProgressCard
                        data={progress}
                        isLoading={progressLoading}
                        isLast={progressLast}
                        onLoadMore={loadMoreProgress}
                    />
                </div>
            </div>
        </div>
    );
}
