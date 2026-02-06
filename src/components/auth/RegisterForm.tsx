// components/auth/RegisterForm.tsx
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useError} from '@/hooks/useError';
import type {RegisterFormValues, RegisterRequest} from '@/types/auth';
import {Link} from "react-router-dom";
import {authService} from "@/services/authService.ts";
import {toast} from "sonner";

const registerSchema = z.object({
    email: z.string().email('Некорректный email адрес'),
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().optional(),
    password: z
        .string()
        .min(8, 'Пароль должен быть не менее 8 символов')
        .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

export function RegisterForm() {
    const {handleError} = useError();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setIsLoading(true);

            // Преобразуем данные формы в формат API
            const registerData: RegisterRequest = {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                password: data.password,
            };

            await authService.register(registerData);
            toast.success('Регистрация прошла успешно! Пожалуйста, проверьте свою электронную почту для подтверждения учетной записи', {
                duration: 6000,
                position: 'top-right',
            });
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Имя *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Иван" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Фамилия</FormLabel>
                                <FormControl>
                                    <Input placeholder="Иванов" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                                <Input placeholder="ваш@email.com" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Пароль *</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
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
                            <FormLabel>Подтверждение пароля *</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Не получили письмо?{' '}
                        <Link to="/resend-verification" className="text-primary hover:underline font-medium">
                            Отправить повторно
                        </Link>
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                </Button>
            </form>
        </Form>
    );
}
