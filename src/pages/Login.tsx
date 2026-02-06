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
            title="Добро пожаловать"
            description="Войдите в свой аккаунт для продолжения"
        >
            <LoginForm/>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Или продолжите с</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mb-4"
                onClick={handleGoogleLogin}
            >
                <FcGoogle className="h-5 w-5"/>
                Войти с Google
            </Button>

            <div className="text-center text-sm space-y-2">
                <p>
                    <span className="text-muted-foreground">Забыли пароль? </span>
                    <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                        Восстановить
                    </Link>
                </p>
                <p>
                    <span className="text-muted-foreground">Нет аккаунта? </span>
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
