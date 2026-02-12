// components/admin/UsersTable.tsx
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Ban, ShieldCheck, User, UserCheck} from 'lucide-react';
import {adminService} from '@/services/adminService';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import type {AdminUserResponse} from "@/types/user.ts";
import type {Page} from "@/types/page.ts";

interface UsersTableProps {
    users: Page<AdminUserResponse>;
    onActionComplete: () => void;
    selectedUserId?: string;
}

export function UsersTable({users, onActionComplete, selectedUserId}: UsersTableProps) {
    const {handleError} = useError();

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

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Регистрация</TableHead>
                        <TableHead>Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.content.map((user) => (
                        <TableRow
                            key={user.id}
                            className={selectedUserId === user.id ? 'bg-accent' : ''}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {selectedUserId === user.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary"/>
                                    )}
                                    <div>
                                        <div>{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">
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
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={user.userBlocked ? "outline" : "destructive"}
                                        className="flex items-center gap-1 hover:scale-105 transition-transform"
                                        onClick={() => handleBlockUser(user.id, user.userBlocked)}
                                    >
                                        {user.userBlocked ? (
                                            <>
                                                <UserCheck className="h-3 w-3"/> Разблокировать
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="h-3 w-3"/> Заблокировать
                                            </>
                                        )}
                                    </Button>

                                    {user.role !== "ADMIN" && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="flex items-center gap-1 hover:scale-105 transition-transform"
                                            onClick={() => handleGrantAdmin(user.id)}
                                        >
                                            <ShieldCheck className="h-3 w-3"/> Админ
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}