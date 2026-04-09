// pages/admin/AdminUsersPage.tsx
import {useCallback, useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {adminUserService} from '@/services/adminUserService.ts';
import {useError} from '@/hooks/useError';
import {Loader2, Users} from 'lucide-react';
import {RootLayout} from '@/components/layout/RootLayout';
import {UsersTable} from '@/components/admin/user/UsersTable.tsx';
import type {AdminUserResponse} from '@/types/user';
import type {Page} from "@/types/page.ts";

// 🔹 Импорт анимаций
import {motion} from 'framer-motion';

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
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<AdminUserResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
    const {handleError} = useError();

    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(0);
    const sizeRef = 50;

    const displayedUsers = search.trim()
        ? searchResults
        : users.content;

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await adminUserService.getUsers(
                page,
                sizeRef,
                sortField,
                sortDirection
            );
            setUsers(response);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError, page, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleActionComplete = async () => {
        if (search.trim()) {
            try {
                const results = await adminUserService.smartSearch(search);
                setSearchResults(results);
            } catch (error) {
                handleError(error);
            }
        } else {
            loadUsers();
        }

        if (selectedUser) {
            adminUserService.getUserById(selectedUser.id)
                .then(updatedUser => setSelectedUser(updatedUser))
                .catch(handleError);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const trimmed = search.trim();

            if (!trimmed) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            try {
                setIsSearching(true);
                const results = await adminUserService.smartSearch(trimmed);
                setSearchResults(results);
            } catch (error) {
                handleError(error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, handleError]);

    useEffect(() => {
        if (!search.trim()) {
            loadUsers();
        }
    }, [loadUsers, search]);

    return (
        <RootLayout>
            {/* 🔹 Основной контейнер с fade-in */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.25}}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* 🔹 Заголовок с slide-up */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.05}}
                >
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="h-8 w-8"/>
                        Управление пользователями
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Поиск, просмотр и управление всеми пользователями платформы
                    </p>
                </motion.div>

                {/* 🔹 Карточка с таблицей */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.15}}
                >
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
                            {/* 🔹 Лоадер внутри карточки (при пагинации/сортировке) */}
                            {isLoading ? (
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="flex justify-center p-12"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <motion.div
                                            animate={{rotate: 360}}
                                            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                                            className="inline-block"
                                        >
                                            <Loader2 className="h-8 w-8 text-primary"/>
                                        </motion.div>
                                        <motion.p
                                            initial={{opacity: 0, y: 4}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{delay: 0.1}}
                                            className="text-muted-foreground"
                                        >
                                            {isSearching ? 'Поиск...' : 'Обновление данных...'}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ) : (
                                <UsersTable
                                    users={displayedUsers}
                                    search={search}
                                    onSearchChange={setSearch}
                                    isSearching={isSearching}

                                    onActionComplete={handleActionComplete}
                                    selectedUserId={selectedUser?.id}
                                    sortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    page={page}
                                    onPageChange={setPage}

                                    totalPages={users.totalPages}
                                    totalElements={users.totalElements}
                                    first={users.first}
                                    last={users.last}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </RootLayout>
    );
}
