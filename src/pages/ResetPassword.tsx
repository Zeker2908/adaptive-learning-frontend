// pages/ResetPassword.tsx
import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPassword } from '@/components/auth/ResetPassword';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Извлекаем токен напрямую при рендере
    const token = useMemo(() => {
        const resetToken = searchParams.get('token');
        if (!resetToken) {
            navigate('/forgot-password', { replace: true });
            return null;
        }
        return resetToken;
    }, [searchParams, navigate]);

    const handleSuccess = () => {
        navigate('/login', { replace: true });
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Новый пароль</CardTitle>
                    <p className="text-center text-muted-foreground">
                        Создайте новый пароль для вашего аккаунта
                    </p>
                </CardHeader>
                <CardContent>
                    <ResetPassword token={token} onSuccess={handleSuccess} />

                    <div className="mt-4 text-center text-sm">
                        <Button asChild variant="link" className="p-0 h-auto font-normal">
                            <Link to="/login">Вернуться к входу</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
