// components/auth/EmailConfirmationForm.tsx
import {useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useError} from '@/hooks/useError';
import {useAuthStore} from "@/store/authStore.ts";
import {toast} from 'sonner';

interface EmailConfirmationFormProps {
    token: string;
    onSuccess?: () => void;
    onError?: () => void;
}

export function EmailConfirmationForm({token, onSuccess, onError}: EmailConfirmationFormProps) {
    const {confirmEmail} = useAuthStore();
    const {handleError} = useError();

    useEffect(() => {
        const confirm = async () => {
            try {
                await confirmEmail({token});
                toast.success('Адрес электронной почты успешно подтверждён!', {
                    duration: 3000,
                    position: 'top-right',
                });
                onSuccess?.();
            } catch (error) {
                handleError(error);
                onError?.();
            }
        };

        confirm();
    }, [token, confirmEmail, handleError, onSuccess, onError]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Подтверждение Email...</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Проверяем ваш email...</p>
                </div>
            </CardContent>
        </Card>
    );
}
