// pages/ForgotPassword.tsx
import {ForgotPassword} from '@/components/auth/ForgotPassword';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {Link} from 'react-router-dom';

export default function ForgotPasswordPage() {
    const handleSuccess = () => {
        // Можно добавить редирект или оставить на странице
    };

    return (
        <AuthLayout
            title="Восстановление пароля"
            description="Введите email, привязанный к вашему аккаунту"
        >
            <ForgotPassword onSuccess={handleSuccess}/>

            <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Вспомнили пароль? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                    Войти
                </Link>
            </div>
        </AuthLayout>
    );
}
