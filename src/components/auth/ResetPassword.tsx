// components/auth/ResetPassword.tsx
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import {Eye, EyeOff} from 'lucide-react';
import type {PasswordFormValues, ResetPasswordRequest} from '@/types/auth';
import {authService} from "@/services/authService.ts";

const resetSchema = z.object({
    password: z
        .string()
        .min(8, 'Пароль должен содержать не менее 8 символов')
        .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    confirmPassword: z.string().min(1, 'Пожалуйста, подтвердите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

interface ResetPasswordProps {
    token: string;
    onSuccess?: () => void;
}

export function ResetPassword({token, onSuccess}: ResetPasswordProps) {
    const {handleError} = useError();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: PasswordFormValues) => {
        try {
            setIsLoading(true);

            // Преобразуем данные формы в формат API
            const resetData: ResetPasswordRequest = {
                token,
                password: data.password,
            };

            await authService.resetPassword(resetData);

            toast.success('Пароль успешно изменен!');

            onSuccess?.();
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Новый пароль</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Подтвердите пароль</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5"/> :
                                            <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                </Button>
            </form>
        </Form>
    );
}