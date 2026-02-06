// pages/Register.tsx
import {RegisterForm} from '@/components/auth/RegisterForm';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {Link} from 'react-router-dom';

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Создать аккаунт"
            description="Присоединяйтесь к нам и начните свое путешествие"
        >
            <RegisterForm/>

            <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Уже есть аккаунт? </span>
                <Link to="/login" className="text-primary hover:underline">
                    Войти
                </Link>
            </div>
        </AuthLayout>
    );
}
