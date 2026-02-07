// components/dashboard/QuickActionsCard.tsx
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

interface Props {
    onSettings: () => void;
    onLogout: () => void;
    onLogoutAll: () => void;
}

export function QuickActionsCard({onSettings, onLogout, onLogoutAll}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
                <CardDescription>Частые действия с аккаунтом</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full" onClick={onSettings}>
                    Настройки аккаунта
                </Button>
                <Button variant="destructive" className="w-full" onClick={onLogout}>
                    Выйти
                </Button>
                <Button className="w-full" onClick={onLogoutAll}>
                    Выйти на всех устройствах
                </Button>
            </CardContent>
        </Card>
    );
}
