// components/profile/Profile.tsx
import {useState} from 'react';
import {useUserStore} from '@/store/userStore';
import {userService} from '@/services/userService';
import {useError} from '@/hooks/useError';
import {toast} from 'sonner';
import {RootLayout} from '@/components/layout/RootLayout';
import {PersonalInfoForm} from '@/components/profile/PersonalInfoForm';
import {PasswordManagementForm} from '@/components/profile/PasswordManagementForm';
import type {BindPasswordRequest, ChangePasswordRequest} from "@/types/auth.ts";
import type {UserUpdateRequest} from "@/types/user.ts";
import {useAuthStore} from "@/store/authStore.ts";


export function ProfilePage() {
    const {user, fetchUser} = useUserStore();
    const {clearToken} = useAuthStore();
    const {handleError} = useError();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateProfile = async (data: UserUpdateRequest) => {
        try {
            setIsSubmitting(true);
            await userService.updateCurrentUser(data);
            await fetchUser();
            toast.success('Профиль успешно обновлен!');
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async (data: ChangePasswordRequest) => {
        try {
            setIsSubmitting(true);
            await userService.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            toast.success('Пароль успешно изменен! Вам нужно заново авторизоваться!');
            clearToken();
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBindPassword = async (data: BindPasswordRequest) => {
        try {
            setIsSubmitting(true);
            await userService.bindPassword(data);
            await fetchUser();
            toast.success('Пароль успешно привязан!');
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                </div>
            </RootLayout>
        );
    }

    return (
        <RootLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Редактирование профиля</h1>
                    <p className="text-muted-foreground">Обновите информацию о вашем аккаунте</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PersonalInfoForm
                        user={user}
                        onSubmit={handleUpdateProfile}
                        isSubmitting={isSubmitting}
                    />

                    <PasswordManagementForm
                        user={user}
                        onChangePassword={handleChangePassword}
                        onBindPassword={handleBindPassword}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </RootLayout>
    );
}