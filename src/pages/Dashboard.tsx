// pages/Dashboard.tsx
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {userService} from "@/services/userService.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {useError} from "@/hooks/useError.ts";
import type {UserResponse} from '@/types/user';

export default function DashboardPage() {
    const navigate = useNavigate();
    const {logout} = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserResponse | null>(null);
    const {handleError} = useError();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await userService.currentUser();
                setUserData(user);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            handleError(error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Добро пожаловать, {userData?.firstName}!
                    </h1>
                    <p className="text-gray-600">Управляйте аккаунтом и отслеживайте прогресс</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Карточка информации о пользователе */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Персональная информация</CardTitle>
                            <CardDescription>Детали вашего аккаунта</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Имя</p>
                                    <p className="font-medium">{userData?.firstName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Фамилия</p>
                                    <p className="font-medium">{userData?.lastName || '-'}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{userData?.email || '-'}</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline" onClick={() => navigate('/profile')}>
                                    Редактировать профиль
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Карточка быстрых действий */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Быстрые действия</CardTitle>
                            <CardDescription>Частые действия с аккаунтом</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => navigate('/settings')}
                            >
                                Настройки аккаунта
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleLogout}
                            >
                                Выйти
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Карточки статистики (заглушки) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Активность</CardTitle>
                            <CardDescription>Ваша недавняя активность</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500 py-8">
                                Нет недавней активности
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Прогресс</CardTitle>
                            <CardDescription>Ваш прогресс обучения</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500 py-8">
                                Отслеживайте прогресс здесь
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
