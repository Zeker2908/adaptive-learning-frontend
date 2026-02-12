// components/admin/UsersTable.tsx
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {ArrowDown, ArrowUp, Ban, MoreVertical, ShieldCheck, User, UserCheck} from 'lucide-react';
import {adminService} from '@/services/adminService';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import type {AdminUserResponse} from "@/types/user.ts";
import type {Page} from "@/types/page.ts";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

interface UsersTableProps {
    users: Page<AdminUserResponse>;
    onActionComplete: () => void;
    selectedUserId?: string;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;
    page: number;
    onPageChange: (page: number) => void;
}

export function UsersTable({
                               users,
                               onActionComplete,
                               selectedUserId,
                               sortField,
                               sortDirection,
                               onSort,
                               page,
                               onPageChange,
                           }: UsersTableProps) {
    const {handleError} = useError();
    const navigate = useNavigate();

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

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;

        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3"/>
            : <ArrowDown className="h-3 w-3"/>;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSort('firstName')}
                        >
                            <div className="flex items-center gap-1">
                                Пользователь
                                {renderSortIcon('firstName')}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSort('email')}
                        >
                            <div className="flex items-center gap-1">
                                Email
                                {renderSortIcon('email')}
                            </div>
                        </TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSort('createdAt')}
                        >
                            <div className="flex items-center gap-1">
                                Регистрация
                                {renderSortIcon('createdAt')}
                            </div>
                        </TableHead>
                        <TableHead>Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.content.map((user) => (
                        <TableRow
                            key={user.id}
                            className={`
                  ${selectedUserId === user.id ? 'bg-accent' : ''}
                  hover:bg-muted/50 cursor-pointer transition-colors
                `}
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {selectedUserId === user.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary"/>
                                    )}
                                    <div>
                                        <div>{user.firstName} {user.lastName}</div>
                                        <div
                                            className="text-xs text-muted-foreground font-mono cursor-pointer hover:underline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(user.id)
                                                    .then(() => toast.success('ID скопирован!'))
                                                    .catch(() => toast.error('Не удалось скопировать'));
                                            }}
                                            title="Кликните, чтобы скопировать ID"
                                        >
                                            {user.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="break-all">{user.email}</TableCell>
                            <TableCell>
                                {user.role === 'ADMIN' ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
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
                            <TableCell>
                                {user.userBlocked ? (
                                    <Badge variant="destructive">
                                        <Ban className="h-3 w-3 mr-1 inline"/>
                                        Заблокирован
                                    </Badge>
                                ) : !user.enabled ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        <User className="h-3 w-3 mr-1 inline"/>
                                        Не активирован
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                                    >
                                        <UserCheck className="h-3 w-3 mr-1 inline"/>
                                        Активен
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="p-1 flex items-center justify-center hover:bg-muted rounded-full">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-48">
                                        {user.userBlocked ? (
                                            <DropdownMenuItem
                                                onClick={() => handleBlockUser(user.id, user.userBlocked)}
                                                className="flex items-center gap-2"
                                            >
                                                <UserCheck className="h-4 w-4"/> Разблокировать
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={() => handleBlockUser(user.id, user.userBlocked)}
                                                className="flex items-center gap-2"
                                            >
                                                <Ban className="h-4 w-4"/> Заблокировать
                                            </DropdownMenuItem>
                                        )}

                                        {user.role !== 'ADMIN' && (
                                            <DropdownMenuItem
                                                onClick={() => handleGrantAdmin(user.id)}
                                                className="flex items-center gap-2"
                                            >
                                                <ShieldCheck className="h-4 w-4"/> Назначить админом
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                    Страница {users.number + 1} из {users.totalPages}
                    {' '}• Всего пользователей: {users.totalElements}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={users.first}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Назад
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={users.last}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Вперёд
                    </Button>
                </div>
            </div>
        </div>
    );
}