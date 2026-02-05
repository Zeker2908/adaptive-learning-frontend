// pages/OAuthCallback.tsx
import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useAuthStore} from '@/store/authStore';
import {toast} from 'sonner';

export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {setToken} = useAuthStore();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            const decodedError = decodeURIComponent(error);
            toast.error(`Sign in failed: ${decodedError}`);
            navigate('/login', {replace: true});
            return;
        }

        if (token) {
            setToken(token);
            toast.success('Successfully signed in with Google!');
            navigate('/dashboard', {replace: true});
        } else {
            toast.error('Authentication failed. Please try again.');
            navigate('/login', {replace: true});
        }
    }, [searchParams, navigate, setToken]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        {searchParams.get('error') ? 'Sign In Failed' : 'Signing In...'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        </div>
    );
}