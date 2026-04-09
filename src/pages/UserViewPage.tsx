// pages/admin/UserViewPage.tsx
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {adminUserService} from '@/services/adminUserService.ts';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import type {AdminUserResponse} from '@/types/user';
import type {DailyActivityResponse, TaskStatisticsResponse, UserProgressResponse} from '@/types/solution';
import {RootLayout} from '@/components/layout/RootLayout';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Ban, ShieldCheck, User, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {AdminUserInfoCard} from "@/components/admin/user/AdminUserInfoCard.tsx";
import {UserStatisticsCard} from "@/components/dashboard/UserStatisticsCard.tsx";

// 🔹 Импорт анимаций
import {motion} from 'framer-motion';

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
                    adminUserService.getUserById(userId),
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

    // 🔹 Анимированный лоадер
    if (isLoading) {
        return (
            <RootLayout>
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="flex items-center justify-center min-h-[60vh]"
                >
                    <div className="text-center space-y-4">
                        <motion.div
                            animate={{rotate: 360}}
                            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                            className="inline-block"
                        >
                            <Loader2 className="h-8 w-8 text-primary"/>
                        </motion.div>
                        <motion.p
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                            className="text-muted-foreground"
                        >
                            Загружаем профиль пользователя...
                        </motion.p>
                    </div>
                </motion.div>
            </RootLayout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <RootLayout>
            {/* 🔹 Основной контейнер с fade-in */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.25}}
                className="max-w-6xl mx-auto space-y-6"
            >
                {/* 🔹 Header с кнопками — анимация появления */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.05}}
                    className="relative flex items-center justify-start gap-4"
                >
                    {/* Стрелка "Назад" с микро-анимацией */}
                    <motion.div
                        className="-ml-6"
                        whileHover={{x: -2}}
                        whileTap={{scale: 0.95}}
                        transition={{duration: 0.1}}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                        </Button>
                    </motion.div>

                    {/* Заголовок и email */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Кнопки действий справа */}
                    <div className="ml-auto flex gap-2">
                        {user.role !== 'ADMIN' && (
                            <motion.div
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                transition={{duration: 0.1}}
                            >
                                <Button
                                    onClick={handleGrantAdmin}
                                    disabled={isActionLoading}
                                >
                                    <ShieldCheck className="h-4 w-4 mr-2"/>
                                    {isActionLoading ? 'Выдача...' : 'Сделать админом'}
                                </Button>
                            </motion.div>
                        )}
                        <motion.div
                            whileHover={{scale: 1.02}}
                            whileTap={{scale: 0.98}}
                            transition={{duration: 0.1}}
                        >
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
                        </motion.div>
                    </div>
                </motion.div>

                {/* 🔹 Карточка с информацией о пользователе */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.1}}
                >
                    <AdminUserInfoCard user={user}/>
                </motion.div>

                {/* 🔹 Grid со статистикой — каскадная анимация карточек */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* UserStatisticsCard — широкая */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3, delay: 0.15}}
                        className="lg:col-span-2"
                    >
                        <UserStatisticsCard
                            statistics={statistics}
                            className="h-full"
                        />
                    </motion.div>

                    {/* ProgressCard */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3, delay: 0.2}}
                    >
                        <ProgressCard
                            data={progress}
                            isLoading={false}
                            isLast={true}
                            hasError={false}
                            onLoadMore={() => {}}
                            onRetry={() => {}}
                        />
                    </motion.div>

                    {/* ActivityChartCard — на всю ширину */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3, delay: 0.25}}
                        className="md:col-span-2 lg:col-span-3"
                    >
                        <ActivityChartCard data={activity}/>
                    </motion.div>
                </div>
            </motion.div>
        </RootLayout>
    );
}
