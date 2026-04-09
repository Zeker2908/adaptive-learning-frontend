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

// 🔹 Импорт анимаций
import {motion} from 'framer-motion';
import {Loader2} from 'lucide-react';

export function ProfilePage() {
    const {user, setUser} = useUserStore();
    const {clearToken} = useAuthStore();
    const {handleError} = useError();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateProfile = async (data: UserUpdateRequest) => {
        try {
            setIsSubmitting(true);
            setUser(await userService.updateCurrentUser(data));
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
            setUser(await userService.bindPassword(data));
            toast.success('Пароль успешно привязан!');
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🔹 Анимированный лоадер
    if (!user) {
        return (
            <RootLayout>
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="flex items-center justify-center min-h-screen"
                >
                    <div className="text-center space-y-4">
                        <motion.div
                            animate={{rotate: 360}}
                            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                            className="inline-block"
                        >
                            <Loader2 className="h-8 w-8 text-primary"/>
                        </motion.div>
                        <motion.p
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                            className="text-muted-foreground"
                        >
                            Загружаем профиль...
                        </motion.p>
                    </div>
                </motion.div>
            </RootLayout>
        );
    }

    return (
        <RootLayout>
            {/* 🔹 Основной контейнер с fade-in */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.25}}
                className="max-w-2xl mx-auto space-y-8"
            >
                {/* 🔹 Заголовок с лёгким slide-up */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.05}}
                >
                    <h1 className="text-2xl font-bold">Редактирование профиля</h1>
                    <p className="text-muted-foreground">
                        Обновите информацию о вашем аккаунте
                    </p>
                </motion.div>

                {/* 🔹 Формы с каскадной анимацией */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.15}}
                >
                    <PersonalInfoForm
                        user={user}
                        onSubmit={handleUpdateProfile}
                        isSubmitting={isSubmitting}
                    />
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.25}}
                >
                    <PasswordManagementForm
                        user={user}
                        onChangePassword={handleChangePassword}
                        onBindPassword={handleBindPassword}
                        isSubmitting={isSubmitting}
                    />
                </motion.div>
            </motion.div>
        </RootLayout>
    );
}
