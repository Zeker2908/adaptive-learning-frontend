// pages/EmailConfirmation.tsx
import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {toast} from 'sonner';
import {EmailConfirmationForm} from '@/components/auth/EmailConfirmationForm';

export default function EmailConfirmationPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    // Если токена нет — сразу редиректим
    useEffect(() => {
        if (!token) {
            toast.error('Некорректная ссылка подтверждения');
            navigate('/login', {replace: true});
        }
    }, [token, navigate]);

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
            <EmailConfirmationForm token={token}/>
        </div>
    );
}
