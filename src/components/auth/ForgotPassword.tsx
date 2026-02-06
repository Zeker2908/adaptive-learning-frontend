// components/auth/ForgotPassword.tsx
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import type {ResendRequest} from '@/types/auth';
import {authService} from "@/services/authService.ts";

const forgotSchema = z.object({
    email: z.string().email('Некорректный адрес электронной почты'),
});

interface ForgotPasswordProps {
    onSuccess?: () => void;
}

export function ForgotPassword({onSuccess}: ForgotPasswordProps) {
    const {handleError} = useError();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ResendRequest>({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ResendRequest) => {
        try {
            setIsLoading(true);
            await authService.forgotPassword(data);

            setIsSuccess(true);
            toast.success('Инструкции по восстановлению пароля отправлены на ваш email!');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <p className="text-green-600">Письмо отправлено!</p>
                <p className="text-muted-foreground text-sm">
                    Проверьте вашу почту и спам-папку
                </p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Отправка...' : 'Восстановить пароль'}
                </Button>
            </form>
        </Form>
    );
}