// components/admin/AdminUserInfoCard.tsx
import type { AdminUserResponse } from '@/types/user.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Ban, ShieldCheck, User, UserCheck } from 'lucide-react';
import React from "react";

interface Props {
    user: AdminUserResponse;
}

export function AdminUserInfoCard({ user }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Общая информация</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem label="Полное имя">
                        {user.firstName} {user.lastName}
                    </InfoItem>

                    <InfoItem label="Email">
                        {user.email}
                    </InfoItem>

                    <InfoItem label="ID пользователя" mono>
                        {user.id}
                    </InfoItem>

                    <InfoItem label="Роль">
                        <div className="flex items-center gap-2">
                            {user.role === 'ADMIN' ? (
                                <>
                                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">Администратор</span>
                                </>
                            ) : (
                                <>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Пользователь</span>
                                </>
                            )}
                        </div>
                    </InfoItem>

                    <InfoItem label="Статус">
                        <div className="flex items-center gap-2">
                            {user.userBlocked ? (
                                <>
                                    <Ban className="h-4 w-4 text-red-500" />
                                    <span className="font-medium text-red-600">
                                        Заблокирован
                                    </span>
                                </>
                            ) : !user.enabled ? (
                                <>
                                    <User className="h-4 w-4 text-yellow-500" />
                                    <span className="font-medium text-yellow-600">
                                        Не активирован
                                    </span>
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                    <span className="font-medium text-green-600">
                                        Активен
                                    </span>
                                </>
                            )}
                        </div>
                    </InfoItem>

                    <InfoItem label="Регистрация">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </InfoItem>

                    <InfoItem label="Тип аутентификации">
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.localUser && (
                                <Badge variant="secondary">Локальная</Badge>
                            )}
                            {user.oauthUser && (
                                <Badge variant="outline">OAuth</Badge>
                            )}
                        </div>
                    </InfoItem>
                </div>
            </CardContent>
        </Card>
    );
}

/* Маленький reusable элемент */
function InfoItem({
                      label,
                      children,
                      mono = false
                  }: {
    label: string;
    children: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className={mono ? 'font-medium font-mono text-xs break-all' : 'font-medium'}>
                {children}
            </div>
        </div>
    );
}
