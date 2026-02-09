// components/profile/BindPasswordForm.tsx
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Eye, EyeOff} from 'lucide-react';
import {useState} from 'react';

const bindPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Пароль должен содержать не менее 8 символов')
        .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
});

export interface BindPasswordFormValues {
    password: string;
}

interface BindPasswordFormProps {
    onSubmit: (data: BindPasswordFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export function BindPasswordForm({onSubmit, isSubmitting}: BindPasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<BindPasswordFormValues>({
        resolver: zodResolver(bindPasswordSchema),
        defaultValues: {
            password: '',
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Привязка пароля</CardTitle>
                <CardDescription>
                    Привяжите пароль к вашему аккаунту для возможности входа по email и паролю
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Новый пароль *</FormLabel>
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
                                                {showPassword ? <EyeOff className="h-5 w-5"/> :
                                                    <Eye className="h-5 w-5"/>}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Привязка...' : 'Привязать пароль'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}