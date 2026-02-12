// pages/admin/AdminUsersPage.tsx
import {useCallback, useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {adminService} from '@/services/adminService';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import {Ban, Loader2, Search, ShieldCheck, User, Users} from 'lucide-react';
import {RootLayout} from '@/components/layout/RootLayout';
import {SmartUserSearch} from '@/components/admin/SmartUserSearch';
import {UsersTable} from '@/components/admin/UsersTable';
import type {AdminUserResponse} from "@/types/user.ts";
import type {Page} from "@/types/page.ts";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Page<AdminUserResponse>>({
        content: [],
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
        size: 20,
        number: 0,
        numberOfElements: 0,
        empty: true,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
    const {handleError} = useError();
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(0);
    const size = 50;

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await adminService.getUsers(
                page,
                size,
                sortField,
                sortDirection
            );
            setUsers(response);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError, page, size, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleUserSelect = (user: AdminUserResponse | null) => {
        setSelectedUser(user);
    };

    const handleActionComplete = () => {
        loadUsers();
        if (selectedUser) {
            adminService.getUserById(selectedUser.id)
                .then(updatedUser => setSelectedUser(updatedUser))
                .catch(handleError);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return (
        <RootLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="h-8 w-8"/>
                        Управление пользователями
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Поиск, просмотр и управление всеми пользователями платформы
                    </p>
                </div>

                {/* Умный поиск */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5"/>
                            Быстрый поиск пользователя
                        </CardTitle>
                        <CardDescription>
                            Введите часть email для автодополнения или полный email/ID для точного поиска
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SmartUserSearch
                            onUserSelect={handleUserSelect}
                            value={selectedUser}
                            placeholder="Начните вводить email или введите полный ID..."
                        />
                    </CardContent>
                </Card>

                {/* Информация о выбранном пользователе */}
                {selectedUser && (
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="text-xl">Выбранный пользователь</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Имя</p>
                                    <p className="font-medium">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">ID</p>
                                    <p className="font-medium font-mono text-xs break-all">
                                        {selectedUser.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Роль</p>
                                    <div className="flex items-center gap-2">
                                        {selectedUser.role === 'ADMIN' ? (
                                            <ShieldCheck className="h-4 w-4 text-blue-500"/>
                                        ) : (
                                            <User className="h-4 w-4 text-muted-foreground"/>
                                        )}
                                        <span className="font-medium">
                      {selectedUser.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                    </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Статус</p>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Статус</p>
                                        <div className="flex items-center gap-2">
                                            {selectedUser.userBlocked ? (
                                                <>
                                                    <Ban className="h-4 w-4 text-red-500"/>
                                                    <span className="font-medium text-red-600">Заблокирован</span>
                                                </>
                                            ) : !selectedUser.enabled ? (
                                                <>
                                                    <User className="h-4 w-4 text-yellow-500"/>
                                                    <span className="font-medium text-yellow-600">Не активирован</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-green-500"/>
                                                    <span className="font-medium text-green-600">Активен</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Регистрация</p>
                                        <p className="font-medium">
                                            {new Date(selectedUser.createdAt).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <Button
                                    onClick={() => setSelectedUser(null)}
                                    variant="outline"
                                >
                                    Очистить выбор
                                </Button>
                                <Button
                                    onClick={() => {
                                        toast.info('Быстрые действия можно добавить здесь');
                                    }}
                                    variant="secondary"
                                >
                                    Действия
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Список всех пользователей */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            Все пользователи
                        </CardTitle>
                        <CardDescription>
                            Полный список пользователей с пагинацией и возможностью управления
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                    <p className="text-muted-foreground">Загрузка пользователей...</p>
                                </div>
                            </div>
                        ) : (
                            <UsersTable
                                users={users}
                                onActionComplete={handleActionComplete}
                                selectedUserId={selectedUser?.id}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                page={page}
                                onPageChange={setPage}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </RootLayout>
    );
}