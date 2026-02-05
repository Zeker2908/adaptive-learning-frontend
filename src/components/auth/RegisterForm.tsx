// components/auth/RegisterForm.tsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useAuthStore} from '@/store/authStore';
import {useError} from '@/hooks/useError';
import type {RegisterRequest} from '@/types/auth';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export function RegisterForm() {
    const navigate = useNavigate();
    const {register: registerUser} = useAuthStore();
    const {handleError, error} = useError();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterRequest>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: RegisterRequest) => {
        try {
            setIsLoading(true);
            await registerUser(data);

            // Redirect to login after successful registration
            navigate('/login', {
                state: {message: 'Registration successful! Please check your email to confirm your account.'}
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

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                        {error.message}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>
        </Form>
    );
}