// pages/ForgotPassword.tsx
import {ForgotPassword} from '@/components/auth/ForgotPassword';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {Link} from 'react-router-dom';

// 🔹 Импорт анимаций
import {motion} from 'framer-motion';

// 🔹 Варианты анимаций (единые для всех auth-страниц)
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

const linkHover = {
    x: 2,
    transition: {duration: 0.15},
};

export default function ForgotPasswordPage() {
    const handleSuccess = () => {
        // Можно добавить редирект или оставить на странице
    };

    return (
        <AuthLayout
            title="Восстановление пароля"
            description="Введите email, привязанный к вашему аккаунту"
        >
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-4"
            >
                <motion.div variants={itemVariants}>
                    <ForgotPassword onSuccess={handleSuccess}/>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="mt-4 text-center text-sm"
                >
                    <span className="text-muted-foreground">Вспомнили пароль? </span>
                    <Link
                        to="/login"
                        className="text-primary hover:underline font-medium inline-flex items-center"
                    >
                        <motion.span
                            whileHover={linkHover}
                            className="inline-block"
                        >
                            Войти
                        </motion.span>
                    </Link>
                </motion.div>
            </motion.div>
        </AuthLayout>
    );
}