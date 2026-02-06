// hooks/useAuth.ts
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '@/store/authStore';
import {authService} from '@/services/authService';
import {toast} from 'sonner';
import type {ConfirmationEmailRequest, LoginRequest, RegisterRequest} from '@/types/auth';

export function useAuth() {
    const navigate = useNavigate();
    const {
        token,
        isAuthenticated,
        login: storeLogin,
        confirmEmail: storeConfirmEmail,
        logout: storeLogout,
        logoutAll: storeLogoutAll,
    } = useAuthStore();

    const login = async (credentials: LoginRequest) => {
        await storeLogin(credentials);
        toast.success('Вход выполнен успешно!', {
            duration: 3000,
            position: 'top-right',
        });
        navigate('/dashboard', {replace: true});
    };

    const register = async (credentials: RegisterRequest) => {
        await authService.register(credentials);
        toast.success('Регистрация прошла успешно! Пожалуйста, проверьте свою электронную почту для подтверждения учетной записи', {
            duration: 6000,
            position: 'top-right',
        });
        navigate('/login', {replace: true});
    };

    const confirmEmail = async (token: ConfirmationEmailRequest) => {
        try {
            await storeConfirmEmail(token);
            toast.success('Адрес электронной почты успешно подтвержден!', {
                duration: 3000,
                position: 'top-right',
            });
            navigate('/dashboard', {replace: true});
        } catch (error) {
            setTimeout(() => {
                navigate('/login', {replace: true});
            }, 3000);
            throw error;
        }
    };

    const logout = async () => {
        try {
            storeLogout();
            toast.success('Выход из системы пройден успешно', {
                duration: 3000,
                position: 'top-right',
            });
            navigate('/login', {replace: true});
        } catch (error) {
            useAuthStore.getState().clearToken();
            navigate('/login', {replace: true});
            throw error;
        }
    };

    const logoutAll = async () => {
        try {
            storeLogoutAll();
            toast.success('Вы успешно вышли из системы на всех устройствах', {
                duration: 3000,
                position: 'top-right',
            });
            navigate('/login', {replace: true});
        } catch (error) {
            useAuthStore.getState().clearToken();
            navigate('/login', {replace: true});
            throw error;
        }
    };

    return {
        token,
        isAuthenticated,
        login,
        register,
        confirmEmail,
        logout,
        logoutAll,
    };
}