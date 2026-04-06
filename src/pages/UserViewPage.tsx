// pages/admin/UserViewPage.tsx
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {adminService} from '@/services/adminService';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import type {AdminUserResponse} from '@/types/user';
import type {DailyActivityResponse, TaskStatisticsResponse, UserProgressResponse} from '@/types/solution';
import {RootLayout} from '@/components/layout/RootLayout';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Ban, ShieldCheck, User} from 'lucide-react';
import {toast} from 'sonner';
import {AdminUserInfoCard} from "@/components/admin/user/AdminUserInfoCard.tsx";
import {UserStatisticsCard} from "@/components/dashboard/UserStatisticsCard.tsx";

export default function UserViewPage() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const {handleError} = useError();

    const [user, setUser] = useState<AdminUserResponse | null>(null);
    const [activity, setActivity] = useState<DailyActivityResponse[]>([]);
    const [progress] = useState<UserProgressResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [statistics, setStatistics] =
        useState<TaskStatisticsResponse | null>(null);


    useEffect(() => {
        const loadUserData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);
                const [userData, activityData, statisticsData] = await Promise.all([
                    adminService.getUserById(userId),
                    solutionService.getDailyActivitiesByAdmin(userId),
                    solutionService.getUserStatisticsByAdmin(userId)
                ]);
                setUser(userData);
                setActivity(activityData);
                setStatistics(statisticsData);
            } catch (error) {
                handleError(error);
                navigate('/admin/users');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [userId, navigate, handleError]);

    const handleGrantAdmin = async () => {
        if (!user) return;
        try {
            setIsActionLoading(true);
            await adminService.grantAdmin(user.id);
            toast.success('Права администратора выданы');
            // Обновляем данные пользователя
            const updatedUser = await adminService.getUserById(user.id);
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
                await adminService.unblockUser(user.id);
                toast.success('Пользователь разблокирован');
            } else {
                await adminService.blockUser(user.id);
                toast.success('Пользователь заблокирован');
            }
            // Обновляем данные пользователя
            const updatedUser = await adminService.getUserById(user.id);
            setUser(updatedUser);
        } catch (error) {
            handleError(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <RootLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                </div>
            </RootLayout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <RootLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Заголовок с кнопками действий */}
                <div className="relative flex items-center justify-start gap-4">
                    {/* Стрелка "Назад", выходит за контейнер */}
                    <div className="-ml-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                        </Button>
                    </div>

                    {/* Заголовок и email */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Кнопки справа */}
                    <div className="ml-auto flex gap-2">
                        {user.role !== 'ADMIN' && (
                            <Button
                                onClick={handleGrantAdmin}
                                disabled={isActionLoading}
                            >
                                <ShieldCheck className="h-4 w-4 mr-2"/>
                                {isActionLoading ? 'Выдача...' : 'Сделать админом'}
                            </Button>
                        )}
                        <Button
                            variant={user.userBlocked ? 'outline' : 'destructive'}
                            onClick={handleBlockUser}
                            disabled={isActionLoading}
                        >
                            {user.userBlocked ? (
                                <>
                                    <User className="h-4 w-4 mr-2"/>
                                    {isActionLoading ? 'Разблокировка...' : 'Разблокировать'}
                                </>
                            ) : (
                                <>
                                    <Ban className="h-4 w-4 mr-2"/>
                                    {isActionLoading ? 'Блокировка...' : 'Заблокировать'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Информация о пользователе */}
                <AdminUserInfoCard
                    user={user}>
                </AdminUserInfoCard>

                {/* Статистика и прогресс */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <UserStatisticsCard
                        statistics={statistics}
                        className="lg:col-span-2"
                    />
                    <ProgressCard
                        data={progress}
                        isLoading={false}
                        isLast={true}
                        hasError={false}
                        onLoadMore={() => {
                        }}
                        onRetry={() => {
                        }}
                    />
                    <ActivityChartCard data={activity}/>
                </div>
            </div>
        </RootLayout>
    );
}
