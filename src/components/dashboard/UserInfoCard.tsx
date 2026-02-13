// components/dashboard/UserInfoCard.tsx
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import type {UserResponse} from '@/types/user';
import {useToast} from "@/hooks/useToast.ts";

interface Props {
    user: UserResponse | null;
}

export function UserInfoCard({user}: Props) {
    const {showSuccessToast} = useToast();
    const copyIdToClipboard = async () => {
        if (!user?.id) return;
        await navigator.clipboard.writeText(user.id);
    };

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Персональная информация</CardTitle>
                <CardDescription>Детали вашего аккаунта</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Info label="Имя" value={user?.firstName}/>
                    <Info label="Фамилия" value={user?.lastName}/>
                    <Info label="Email" value={user?.email}/>

                    {/* Поле ID */}
                    <div>
                        <p className="text-sm text-gray-500">ID пользователя</p>
                        <div className="flex items-center gap-2">
                            <p className="font-medium truncate" title={user?.id}>
                                {user?.id ? `${user.id.substring(0, 8)}...` : '-'}
                            </p>
                            {user?.id && (
                                <button
                                    type="button"
                                    onClick={showSuccessToast(copyIdToClipboard, 'ID скопирован в буфер обмена')}
                                    className="text-gray-400 hover:text-primary transition-colors"
                                    title="Копировать ID"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="shrink-0"
                                    >
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                                        <path
                                            d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Info({label, value}: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}