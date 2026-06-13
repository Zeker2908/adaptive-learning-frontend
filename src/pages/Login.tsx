// pages/Login.tsx
import {LoginForm} from '@/components/auth/LoginForm';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {FcGoogle} from 'react-icons/fc';
import {oauthService} from '@/services/oauthService';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {useAuthStore} from '@/store/authStore';
import {useError} from '@/hooks/useError';

// 🔹 Импорт анимаций
import {motion} from 'framer-motion';

// 🔹 Варианты анимаций (вынесены для чистоты кода)
const containerVariants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {staggerChildren: 0.1, delayChildren: 0.15},
    },
};

const itemVariants = {
    hidden: {opacity: 0, y: 16},
    visible: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number]},
    },
};

const buttonHover = {
    scale: 1.02,
    transition: {duration: 0.15},
};

const buttonTap = {
    scale: 0.98,
    transition: {duration: 0.1},
};

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {login} = useAuthStore();
    const {handleError} = useError();
    const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
    const autoLoginAttemptedRef = useRef(false);

    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message, {
                duration: 6000,
                position: 'top-right',
            });
        }
    }, [location.state?.message]);

    useEffect(() => {
        const email = searchParams.get('email');
        const password = searchParams.get('password');

        if (!email || !password || autoLoginAttemptedRef.current) {
            return;
        }

        autoLoginAttemptedRef.current = true;
        navigate('/login', {replace: true});

        const autoLogin = async () => {
            try {
                setIsAutoLoggingIn(true);
                await login({email, password});
                toast.success('Вход выполнен успешно!', {
                    duration: 3000,
                    position: 'top-right',
                });
            } catch (err) {
                handleError(err);
            } finally {
                setIsAutoLoggingIn(false);
            }
        };

        void autoLogin();
    }, [searchParams, navigate, login, handleError]);

    const handleGoogleLogin = () => {
        oauthService.googleLogin();
    };

    if (isAutoLoggingIn) {
        return (
            <AuthLayout
                title="Добро пожаловать"
                description="Выполняется вход..."
            >
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Добро пожаловать"
            description="Войдите в свой аккаунт для продолжения"
        >
            {/* 🔹 Контейнер с каскадной анимацией */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-4"
            >
                {/* 🔹 LoginForm */}
                <motion.div variants={itemVariants}>
                    <LoginForm/>
                </motion.div>

                {/* 🔹 Divider "Или продолжите с" */}
                <motion.div variants={itemVariants} className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Или продолжите с</span>
                    </div>
                </motion.div>

                {/* 🔹 Кнопка Google с микро-анимацией */}
                <motion.div
                    variants={itemVariants}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                >
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 mb-4"
                        onClick={handleGoogleLogin}
                    >
                        <FcGoogle className="h-5 w-5"/>
                        Войти с Google
                    </Button>
                </motion.div>

                {/* 🔹 Футер с ссылками */}
                <motion.div variants={itemVariants} className="text-center text-sm space-y-2">
                    <p>
                        <span className="text-muted-foreground">Забыли пароль? </span>
                        <Link
                            to="/forgot-password"
                            className="text-primary hover:underline font-medium"
                        >
                            Восстановить
                        </Link>
                    </p>
                    <p>
                        <span className="text-muted-foreground">Нет аккаунта? </span>
                        <Link
                            to="/register"
                            className="text-primary hover:underline font-medium"
                        >
                            Зарегистрироваться
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </AuthLayout>
    );
}
