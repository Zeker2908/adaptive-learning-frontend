// hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
    const { token, isAuthenticated, login, register, logout } = useAuthStore();

    return {
        token,
        isAuthenticated,
        login,
        register,
        logout,
    };
}