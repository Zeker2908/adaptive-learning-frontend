// pages/EmailConfirmation.tsx
import {useNavigate, useSearchParams} from 'react-router-dom';
import {EmailConfirmationForm} from '@/components/auth/EmailConfirmationForm';

export default function EmailConfirmationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const handleSuccess = () => {
        navigate('/dashboard', {replace: true});
    };
    const handleErrorAndRedirect = () => {
        navigate('/register', {replace: true});
    };

    if (!token) {
        handleErrorAndRedirect();
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
            <EmailConfirmationForm token={token} onSuccess={handleSuccess} onError={handleErrorAndRedirect}/>
        </div>
    );
}