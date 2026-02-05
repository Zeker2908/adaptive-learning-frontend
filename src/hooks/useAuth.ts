// hooks/useAuth.ts
import {useCallback} from 'react';
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
        logoutAll: storeLogoutAll
    } = useAuthStore();

    const login = useCallback(async (credentials: LoginRequest) => {
        await storeLogin(credentials);
        toast.success('Successfully signed in!', {
            duration: 3000,
            position: 'top-right'
        });
        navigate('/dashboard', {replace: true});
    }, [storeLogin, navigate]);

    const register = useCallback(async (credentials: RegisterRequest) => {
        await authService.register(credentials);
        toast.success('Registration successful! Please check your email to confirm your account.', {
            duration: 6000,
            position: 'top-right'
        });
    }, []);

    const confirmEmail = useCallback(async (token: ConfirmationEmailRequest) => {
        try {
            await storeConfirmEmail(token);
            toast.success('Email confirmed successfully!', {
                duration: 3000,
                position: 'top-right'
            });
            navigate('/dashboard', {replace: true});
        } catch (error) {
            setTimeout(() => {
                navigate('/login', {replace: true});
            }, 3000);
            throw error;
        }
    }, [storeConfirmEmail, navigate]);

    const logout = useCallback(async () => {
        try {
            storeLogout();
            toast.success('Successfully logged out', {
                duration: 3000,
                position: 'top-right'
            });
            navigate('/login', {replace: true});
        } catch (error) {
            useAuthStore.getState().clearToken();
            navigate('/login', {replace: true});
            throw error;
        }
    }, [storeLogout, navigate]);

    const logoutAll = useCallback(async () => {
        try {
            storeLogoutAll();
            toast.success('Logged out from all devices', {
                duration: 3000,
                position: 'top-right'
            });
            navigate('/login', {replace: true});
        } catch (error) {
            useAuthStore.getState().clearToken();
            navigate('/login', {replace: true});
            throw error;
        }
    }, [storeLogoutAll, navigate]);

    return {
        token,
        isAuthenticated,
        login,
        register,
        confirmEmail,
        logout,
        logoutAll
    };
}