import {useEffect, useState, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {adminUserService} from '@/services/adminUserService.ts';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import type {AdminUserResponse} from '@/types/user';
import type {
    DailyActivityResponse,
    TaskStatisticsResponse,
    UserProgressResponse
} from '@/types/solution';
import {RootLayout} from '@/components/layout/RootLayout';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Ban, ShieldCheck, User, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {AdminUserInfoCard} from "@/components/admin/user/AdminUserInfoCard.tsx";
import {UserStatisticsCard} from "@/components/dashboard/UserStatisticsCard.tsx";
import {motion} from 'framer-motion';

export default function UserViewPage() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const {handleError} = useError();

    const [user, setUser] = useState<AdminUserResponse | null>(null);
    const [activity, setActivity] = useState<DailyActivityResponse[]>([]);
    const [progress, setProgress] = useState<UserProgressResponse[]>([]);
    const [statistics, setStatistics] = useState<TaskStatisticsResponse | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // 🔹 Пагинация прогресса
    const [progressPage, setProgressPage] = useState(0);
    const [progressLast, setProgressLast] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);
    const [progressError, setProgressError] = useState(false);

    // 🔹 Загрузка основной информации + первая страница прогресса
    useEffect(() => {
        const loadUserData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);

                const [userData, activityData, statisticsData, progressPageData] = await Promise.all([
                    adminUserService.getUserById(userId),
                    solutionService.getDailyActivitiesByAdmin(userId),
                    solutionService.getUserStatisticsByAdmin(userId),
                    solutionService.getUserProgressByAdmin(userId, 0)
                ]);

                setUser(userData);
                setActivity(activityData);
                setStatistics(statisticsData);
                setProgress(progressPageData.content);
                setProgressLast(progressPageData.last);
                setProgressPage(1);

            } catch (error) {
                handleError(error);
                navigate('/admin/users');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [userId, navigate, handleError]);

    // 🔹 Догрузка прогресса (как в Dashboard)
    const loadMoreProgress = useCallback(async () => {
        if (progressLoading || progressLast || !userId) return;

        try {
            setProgressLoading(true);
            setProgressError(false);

            const page = await solutionService.getUserProgressByAdmin(userId, progressPage);

            setProgress(prev => [...prev, ...page.content]);
            setProgressLast(page.last);
            setProgressPage(prev => prev + 1);

        } catch (error) {
            handleError(error);
            setProgressError(true);
        } finally {
            setProgressLoading(false);
        }
    }, [progressLoading, progressLast, progressPage, userId, handleError]);

    const handleGrantAdmin = async () => {
        if (!user) return;

        try {
            setIsActionLoading(true);
            await adminUserService.grantAdmin(user.id);
            toast.success('Права администратора выданы');

            const updatedUser = await adminUserService.getUserById(user.id);
            setUser(updatedUser);

        } catch (error) {
            handleError(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBlockUser = async () => {
        if (!user) return;

        try {
            setIsActionLoading(true);

            if (user.userBlocked) {
                await adminUserService.unblockUser(user.id);
                toast.success('Пользователь разблокирован');
            } else {
                await adminUserService.blockUser(user.id);
                toast.success('Пользователь заблокирован');
            }

            const updatedUser = await adminUserService.getUserById(user.id);
            setUser(updatedUser);

        } catch (error) {
            handleError(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    // 🔹 Loader
    if (isLoading) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin"/>
                </div>
            </RootLayout>
        );
    }

    if (!user) return null;

    return (
        <RootLayout>
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className="max-w-6xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                    </Button>

                    <div>
                        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="ml-auto flex gap-2">
                        {user.role !== 'ADMIN' && (
                            <Button onClick={handleGrantAdmin} disabled={isActionLoading}>
                                <ShieldCheck className="h-4 w-4 mr-2"/>
                                Сделать админом
                            </Button>
                        )}

                        <Button
                            variant={user.userBlocked ? 'outline' : 'destructive'}
                            onClick={handleBlockUser}
                            disabled={isActionLoading}
                        >
                            {user.userBlocked ? <User className="h-4 w-4 mr-2"/> : <Ban className="h-4 w-4 mr-2"/>}
                            {user.userBlocked ? 'Разблокировать' : 'Заблокировать'}
                        </Button>
                    </div>
                </div>

                {/* Info */}
                <AdminUserInfoCard user={user}/>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <UserStatisticsCard statistics={statistics} className="h-full"/>
                    </div>

                    <ProgressCard
                        data={progress}
                        isLoading={progressLoading}
                        isLast={progressLast}
                        hasError={progressError}
                        onLoadMore={loadMoreProgress}
                        onRetry={loadMoreProgress}
                    />

                    <div className="md:col-span-2 lg:col-span-3">
                        <ActivityChartCard data={activity}/>
                    </div>
                </div>
            </motion.div>
        </RootLayout>
    );
}
