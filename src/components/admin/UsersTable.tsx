// components/admin/UsersTable.tsx

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

import {Badge} from '@/components/ui/badge';
import {ArrowDown, ArrowUp, Ban, MoreVertical, ShieldCheck, User, UserCheck} from 'lucide-react';

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {adminService} from '@/services/adminService';
import {useError} from '@/hooks/useError';

import type {AdminUserResponse} from '@/types/user';

interface UsersTableProps {
    users: AdminUserResponse[];

    search: string;
    onSearchChange: (value: string) => void;
    isSearching: boolean;

    onActionComplete: () => void;

    selectedUserId?: string;

    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;

    page: number;
    onPageChange: (page: number) => void;

    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
}

export function UsersTable({
                               users,
                               search,
                               onSearchChange,
                               isSearching,
                               onActionComplete,
                               selectedUserId,
                               sortField,
                               sortDirection,
                               onSort,
                               page,
                               onPageChange,
                               totalPages,
                               totalElements,
                               first,
                               last
                           }: UsersTableProps) {

    const {handleError} = useError();
    const navigate = useNavigate();

    // =========================
    // Actions
    // =========================

    const handleBlockUser = async (userId: string, isBlocked: boolean) => {
        try {
            if (isBlocked) {
                await adminService.unblockUser(userId);
                toast.success('Пользователь разблокирован');
            } else {
                await adminService.blockUser(userId);
                toast.success('Пользователь заблокирован');
            }

            onActionComplete();
        } catch (error) {
            handleError(error);
        }
    };

    const handleGrantAdmin = async (userId: string) => {
        try {
            await adminService.grantAdmin(userId);
            toast.success('Права администратора выданы');

            onActionComplete();
        } catch (error) {
            handleError(error);
        }
    };

    // =========================
    // Sorting icon
    // =========================

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;

        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3"/>
            : <ArrowDown className="h-3 w-3"/>;
    };

    // =========================
    // Render
    // =========================

    return (
        <div className="rounded-md border">

            {/* 🔎 Search */}
            <div className="p-4 border-b">
                <Input
                    placeholder="Поиск по email или UUID..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>

                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => !search && onSort('firstName')}
                        >
                            <div className="flex items-center gap-1">
                                Пользователь
                                {!search && renderSortIcon('firstName')}
                            </div>
                        </TableHead>

                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => !search && onSort('email')}
                        >
                            <div className="flex items-center gap-1">
                                Email
                                {!search && renderSortIcon('email')}
                            </div>
                        </TableHead>

                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>

                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => !search && onSort('createdAt')}
                        >
                            <div className="flex items-center gap-1">
                                Регистрация
                                {!search && renderSortIcon('createdAt')}
                            </div>
                        </TableHead>

                        <TableHead>Действия</TableHead>

                    </TableRow>
                </TableHeader>

                <TableBody>

                    {users.map((user) => (
                        <TableRow
                            key={user.id}
                            className={`
                                ${selectedUserId === user.id ? 'bg-accent' : ''}
                                hover:bg-muted/50 cursor-pointer transition-colors
                            `}
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                        >

                            {/* Пользователь */}
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {selectedUserId === user.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary"/>
                                    )}

                                    <div>
                                        <div>{user.firstName} {user.lastName}</div>

                                        <div
                                            className="text-xs text-muted-foreground font-mono cursor-pointer hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(user.id)
                                                    .then(() => toast.success('ID скопирован!'))
                                                    .catch(() => toast.error('Не удалось скопировать'));
                                            }}
                                        >
                                            {user.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Email */}
                            <TableCell className="break-all">
                                {user.email}
                            </TableCell>

                            {/* Role */}
                            <TableCell>
                                {user.role === 'ADMIN' ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                        <ShieldCheck className="h-3 w-3 mr-1 inline"/>
                                        Админ
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">
                                        <User className="h-3 w-3 mr-1 inline"/>
                                        Пользователь
                                    </Badge>
                                )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                {user.userBlocked ? (
                                    <Badge variant="destructive">
                                        <Ban className="h-3 w-3 mr-1 inline"/>
                                        Заблокирован
                                    </Badge>
                                ) : !user.enabled ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        Не активирован
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                        <UserCheck className="h-3 w-3 mr-1 inline"/>
                                        Активен
                                    </Badge>
                                )}
                            </TableCell>

                            {/* Created */}
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 hover:bg-muted rounded-full"
                                        >
                                            <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-48">

                                        <DropdownMenuItem
                                            onClick={() => handleBlockUser(user.id, user.userBlocked)}
                                        >
                                            {user.userBlocked ? 'Разблокировать' : 'Заблокировать'}
                                        </DropdownMenuItem>

                                        {user.role !== 'ADMIN' && (
                                            <DropdownMenuItem
                                                onClick={() => handleGrantAdmin(user.id)}
                                            >
                                                Назначить админом
                                            </DropdownMenuItem>
                                        )}

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>

                        </TableRow>
                    ))}

                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                {isSearching ? 'Поиск...' : 'Ничего не найдено'}
                            </TableCell>
                        </TableRow>
                    )}

                </TableBody>
            </Table>

            {/* Pagination (hidden during search) */}
            {!search.trim() && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-muted-foreground">
                        Страница {page + 1} из {totalPages}
                        {' '}• Всего пользователей: {totalElements}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={first}
                            onClick={() => onPageChange(page - 1)}
                        >
                            Назад
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={last}
                            onClick={() => onPageChange(page + 1)}
                        >
                            Вперёд
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}
