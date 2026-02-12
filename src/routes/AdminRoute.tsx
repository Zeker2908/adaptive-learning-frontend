// routes/AdminRoute.tsx
import {Outlet, useLocation} from 'react-router-dom';
import {useUserStore} from '@/store/userStore';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export function AdminRoute() {
    const {isAdmin} = useUserStore();

    useLocation();
    if (!isAdmin()) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Доступ запрещён</CardTitle>
                        <CardDescription>
                            У вас недостаточно прав для доступа к этой странице.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <button
                            onClick={() => window.history.back()}
                            className="text-primary hover:underline font-medium"
                        >
                            Вернуться назад
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <Outlet/>;
}