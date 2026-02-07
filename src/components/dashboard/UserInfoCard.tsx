// components/dashboard/UserInfoCard.tsx
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type {UserResponse} from '@/types/user';
import {useToast} from "@/hooks/useToast.ts";

interface Props {
    user: UserResponse | null;
    onEdit: () => void;
}

export function UserInfoCard({user, onEdit}: Props) {
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

                    {/* Email + ID в одной строке */}
                    <div className="sm:col-span-2">
                        <p className="text-sm text-gray-500">Email</p>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{user?.email || '-'}</p>
                            {user?.id && (
                                <button
                                    type="button"
                                    onClick={showSuccessToast(copyIdToClipboard, 'ID скопирован в буфер обмена')}
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                    title={`ID: ${user.id}`}
                                >
                                    <span>ID: {user.id.substring(0, 8)}...</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                                        <path
                                            d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <Button variant="outline" onClick={onEdit}>
                    Редактировать профиль
                </Button>
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