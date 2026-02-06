// components/auth/EmailConfirmationForm.tsx
import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useError} from '@/hooks/useError';
import {useNavigate} from "react-router-dom";
import {toast} from 'sonner';
import {useAuthStore} from "@/store/authStore.ts";

interface EmailConfirmationFormProps {
    token: string;
}

export function EmailConfirmationForm({token}: EmailConfirmationFormProps) {
    const navigate = useNavigate();
    const {confirmEmail} = useAuthStore();
    const {handleError} = useError();
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        const confirm = async () => {
            try {
                await confirmEmail({token});
                toast.success('Адрес электронной почты успешно подтвержден!', {
                    duration: 3000,
                    position: 'top-right',
                });
                navigate('/dashboard', {replace: true});
                setIsConfirmed(true);
            } catch (error) {
                setIsConfirmed(false);
                handleError(error);
                setTimeout(() => {
                    navigate('/login', {replace: true});
                }, 3000);
            } finally {
                setIsLoading(false);
            }
        };

        confirm();
    }, [token, handleError, navigate, confirmEmail]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">
                    {isLoading ? 'Подтверждение Email...' : isConfirmed ? 'Успешно!' : 'Ошибка'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                {isLoading && (
                    <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Проверяем ваш email...</p>
                    </div>
                )}

                {!isLoading && isConfirmed && (
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <p className="text-green-600">Ваш email подтверждён!</p>
                        <p className="text-muted-foreground text-sm">Перенаправляем в личный кабинет...</p>
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
                        <p className="text-red-600">Не удалось подтвердить email</p>
                        <p className="text-muted-foreground text-sm">Перенаправляем на вход...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}