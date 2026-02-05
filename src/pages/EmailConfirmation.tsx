// pages/EmailConfirmation.tsx
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useAuthStore} from '@/store/authStore';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import {authService} from "@/services/authService.ts";
import type {ConfirmationEmailRequest} from "@/types/auth.ts";

export default function EmailConfirmationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {setToken} = useAuthStore();
    const {handleError} = useError();
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        const confirmEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                toast.error('Invalid confirmation link');
                navigate('/login', {replace: true});
                return;
            }

            const confirmationRequest: ConfirmationEmailRequest = {
                token: token,
            };

            try {
                setIsLoading(true);
                const response = await authService.confirmEmail(confirmationRequest);

                // Устанавливаем токен в store
                setToken(response.token);
                setIsConfirmed(true);

                // Показываем уведомление об успехе
                toast.success('Email confirmed successfully!');

                // Редирект на главную через 1.5 секунды для лучшего UX
                setTimeout(() => {
                    navigate('/', {replace: true});
                }, 1500);

            } catch (error) {
                handleError(error);
                // После ошибки редиректим на логин
                setTimeout(() => {
                    navigate('/login', {replace: true});
                }, 3000);
            } finally {
                setIsLoading(false);
            }
        };

        confirmEmail();
    }, [searchParams, navigate, setToken, handleError]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        {isLoading ? 'Confirming Email...' : isConfirmed ? 'Success!' : 'Error'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {isLoading && (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-muted-foreground">Verifying your email...</p>
                        </div>
                    )}

                    {!isLoading && isConfirmed && (
                        <div className="text-center space-y-2">
                            <div
                                className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <p className="text-green-600">Your email has been confirmed!</p>
                            <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
                        </div>
                    )}

                    {!isLoading && !isConfirmed && (
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </div>
                            <p className="text-red-600">Failed to confirm email</p>
                            <p className="text-muted-foreground text-sm">Redirecting to login...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}