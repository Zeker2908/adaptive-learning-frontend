// pages/Login.tsx
import {LoginForm} from '@/components/auth/LoginForm';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {Link, useLocation} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {FcGoogle} from 'react-icons/fc';
import {oauthService} from '@/services/oauthService';
import {useEffect} from 'react';
import {toast} from 'sonner';

export default function LoginPage() {
    const location = useLocation();

    // Показываем уведомление, если пришли после регистрации
    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message, {
                duration: 6000,
                position: 'top-right',
            });
        }
    }, [location.state?.message]);

    const handleGoogleLogin = () => {
        oauthService.googleLogin();
    };

    return (
        <AuthLayout
            title="С возвращением"
            description="Войдите в свой аккаунт, чтобы продолжить"
        >
            <LoginForm/>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Или продолжите через</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
            >
                <FcGoogle className="h-5 w-5"/>
                Войти через Google
            </Button>

            <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Нет аккаунта? </span>
                <Link to="/register" className="text-primary hover:underline">
                    Зарегистрироваться
                </Link>
            </div>
        </AuthLayout>
    );
}
