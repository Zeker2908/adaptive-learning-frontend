// components/auth/LoginForm.tsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useError} from '@/hooks/useError';
import type {LoginRequest} from '@/types/auth';
import {toast} from "sonner";
import {useAuthStore} from "@/store/authStore.ts";

const loginSchema = z.object({
    email: z.string().email('Некорректный email адрес'),
    password: z.string().min(1, 'Пароль обязателен'),
});

export function LoginForm() {
    useNavigate();
    const {login} = useAuthStore();
    const {handleError} = useError();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginRequest) => {
        try {
            setIsLoading(true);
            await login(data);
            toast.success('Вход выполнен успешно!', {
                duration: 3000,
                position: 'top-right',
            });
            navigate('/dashboard', {replace: true});
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
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
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
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                </Button>
            </form>
        </Form>
    );
}
