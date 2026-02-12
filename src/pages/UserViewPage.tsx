// pages/admin/UserViewPage.tsx
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {adminService} from '@/services/adminService';
import {solutionService} from '@/services/solutionService';
import {useError} from '@/hooks/useError';
import type {AdminUserResponse} from '@/types/user';
import type {DailyActivityResponse, UserProgressResponse} from '@/types/solution';
import {RootLayout} from '@/components/layout/RootLayout';
import {ActivityChartCard} from '@/components/dashboard/ActivityChartCard';
import {ProgressCard} from '@/components/dashboard/ProgressCard';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ArrowLeft, Ban, ShieldCheck, User, UserCheck} from 'lucide-react';
import {toast} from 'sonner';

export default function UserViewPage() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const {handleError} = useError();

    const [user, setUser] = useState<AdminUserResponse | null>(null);
    const [activity, setActivity] = useState<DailyActivityResponse[]>([]);
    const [progress] = useState<UserProgressResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);
                const [userData, activityData] = await Promise.all([
                    adminService.getUserById(userId),
                    solutionService.getDailyActivitiesByAdmin(userId)
                ]);
                setUser(userData);
                setActivity(activityData);
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
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/users')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2"/>
                                Назад к списку
                            </Button>
                            <h1 className="text-2xl font-bold">Профиль пользователя</h1>
                        </div>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="flex gap-2">
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
                <Card>
                    <CardHeader>
                        <CardTitle>Общая информация</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Полное имя</p>
                                <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ID пользователя</p>
                                <p className="font-medium font-mono text-xs break-all">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Роль</p>
                                <div className="flex items-center gap-2">
                                    {user.role === 'ADMIN' ? (
                                        <ShieldCheck className="h-4 w-4 text-blue-500"/>
                                    ) : (
                                        <User className="h-4 w-4 text-muted-foreground"/>
                                    )}
                                    <span className="font-medium">
                    {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Статус</p>
                                <div className="flex items-center gap-2">
                                    {user.userBlocked ? (
                                        <>
                                            <Ban className="h-4 w-4 text-red-500"/>
                                            <span className="font-medium text-red-600">Заблокирован</span>
                                        </>
                                    ) : !user.enabled ? (
                                        <>
                                            <User className="h-4 w-4 text-yellow-500"/>
                                            <span className="font-medium text-yellow-600">Не активирован</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="h-4 w-4 text-green-500"/>
                                            <span className="font-medium text-green-600">Активен</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Регистрация</p>
                                <p className="font-medium">
                                    {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Тип аутентификации</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {user.localUser && (
                                        <Badge variant="secondary">Локальная</Badge>
                                    )}
                                    {user.oauthUser && (
                                        <Badge variant="outline">OAuth</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Статистика и прогресс */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActivityChartCard data={activity}/>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Статистика</CardTitle>
                            <CardDescription>Общая информация о деятельности</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Решено задач</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Точность</p>
                                <p className="text-2xl font-bold">0%</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Активных дней</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RootLayout>
    );
}
