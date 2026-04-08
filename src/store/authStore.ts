// store/authStore.ts
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {authService} from '@/services/authService';
import {useUserStore} from './userStore';
import type {ConfirmationEmailRequest, LoginRequest} from '@/types/auth';
import {clearQueueStorage} from "@/hooks/useQueueState.ts";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    confirmEmail: (data: ConfirmationEmailRequest) => Promise<void>;
    logout: () => void;
    logoutAll: () => void;
    setToken: (token: string) => void;
    clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            isAuthenticated: false,

            login: async (credentials) => {
                const response = await authService.login(credentials);
                set({token: response.token, isAuthenticated: true});
            },

            confirmEmail: async (data) => {
                const response = await authService.confirmEmail(data);
                set({token: response.token, isAuthenticated: true});
            },

            logout: () => {
                authService.logout().finally(() => {
                    set({token: null, isAuthenticated: false});
                    useUserStore.getState().clearUser();
                });
                clearQueueStorage();
            },

            logoutAll: () => {
                authService.logoutAll().finally(() => {
                    set({token: null, isAuthenticated: false});
                    useUserStore.getState().clearUser();
                });
                clearQueueStorage();
            },

            setToken: (token) => set({token, isAuthenticated: true}),

            clearToken: () => {
                set({token: null, isAuthenticated: false})
                useUserStore.getState().clearUser();
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);