// components/profile/PersonalInfoForm.tsx
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import type {UserResponse, UserUpdateRequest} from '@/types/user';

const personalInfoSchema = z.object({
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().optional(),
});

interface PersonalInfoFormProps {
    user: UserResponse;
    onSubmit: (data: UserUpdateRequest) => Promise<void>;
    isSubmitting: boolean;
}

export function PersonalInfoForm({user, onSubmit, isSubmitting}: PersonalInfoFormProps) {
    const form = useForm<UserUpdateRequest>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Персональная информация</CardTitle>
                <CardDescription>Обновите ваше имя и фамилию</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email — только для чтения */}
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    value={user.email || '-'}
                                    disabled
                                    readOnly
                                    className="bg-muted"
                                />
                            </FormControl>
                        </FormItem>

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

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}