// pages/ResendVerification.tsx
import {ResendVerification} from '@/components/auth/ResendVerification';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {Link} from 'react-router-dom';

export default function ResendVerificationPage() {
    const handleSuccess = () => {
        // Можно добавить редирект или оставить на странице
    };

    return (
        <AuthLayout
            title="Повторная отправка письма"
            description="Введите email, на который было отправлено письмо подтверждения"
        >
            <ResendVerification onSuccess={handleSuccess}/>

            <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Уже подтвердили аккаунт? </span>
                <Link to="/login" className="text-primary hover:underline">
                    Войти
                </Link>
            </div>
        </AuthLayout>
    );
}