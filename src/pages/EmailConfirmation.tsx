// pages/EmailConfirmation.tsx
import {useMemo} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {toast} from 'sonner';
import {EmailConfirmationForm} from '@/components/auth/EmailConfirmationForm';

export default function EmailConfirmationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Проверяем токен сразу при рендере — как в ResetPasswordPage
    const token = useMemo(() => {
        const confirmToken = searchParams.get('token');
        if (!confirmToken) {
            toast.error('Некорректная ссылка подтверждения');
            navigate('/login', {replace: true});
            return null;
        }
        return confirmToken;
    }, [searchParams, navigate]);

    // Пока идёт редирект (если токена нет), показываем спиннер вместо "мигания"
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
            <EmailConfirmationForm token={token}/>
        </div>
    );
}