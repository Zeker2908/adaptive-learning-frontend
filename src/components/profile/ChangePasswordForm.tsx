// components/profile/ChangePasswordForm.tsx
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Eye, EyeOff} from 'lucide-react';
import {useState} from 'react';
import type {ChangePasswordFormValues} from "@/types/auth.ts";

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Текущий пароль обязателен'),
    newPassword: z.string()
        .min(8, 'Новый пароль должен содержать не менее 8 символов')
        .regex(/[a-zA-Z]/, 'Новый пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Новый пароль должен содержать хотя бы одну цифру'),
    confirmPassword: z.string().min(1, 'Подтверждение пароля обязательно'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

interface ChangePasswordFormProps {
    onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export function ChangePasswordForm({ onSubmit, isSubmitting }: ChangePasswordFormProps) {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Смена пароля</CardTitle>
                <CardDescription>Измените ваш текущий пароль</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Текущий пароль *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showOldPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                            >
                                                {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Новый пароль *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Подтвердите пароль *</FormLabel>
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
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Сохранение...' : 'Изменить пароль'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}