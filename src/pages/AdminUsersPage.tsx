// pages/admin/AdminUsersPage.tsx
import {useCallback, useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {adminService} from '@/services/adminService';
import {useError} from '@/hooks/useError';
import {Users} from 'lucide-react';
import {RootLayout} from '@/components/layout/RootLayout';
import {UsersTable} from '@/components/admin/UsersTable';
import type {AdminUserResponse} from '@/types/user';
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

                {/* Список всех пользователей */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            Все пользователи
                        </CardTitle>
                        <CardDescription>
                            Кликните на пользователя, чтобы просмотреть его профиль и статистику
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
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