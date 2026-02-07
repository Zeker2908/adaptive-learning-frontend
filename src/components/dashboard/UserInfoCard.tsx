// components/dashboard/UserInfoCard.tsx
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type {UserResponse} from '@/types/user';

interface Props {
    user: UserResponse | null;
    onEdit: () => void;
}

export function UserInfoCard({user, onEdit}: Props) {
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
                    <Info label="Email" value={user?.email} full/>
                </div>

                <Button variant="outline" onClick={onEdit}>
                    Редактировать профиль
                </Button>
            </CardContent>
        </Card>
    );
}

function Info({label, value, full}: {label: string; value?: string; full?: boolean}) {
    return (
        <div className={full ? 'sm:col-span-2' : undefined}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}
