// store/userStore.ts
import {create} from 'zustand';
import {userService} from '@/services/userService';
import type {UserResponse} from "@/types/user.ts";
import type {ApiError} from "@/types/auth.ts";

interface UserState {
    user: UserResponse | null;
    isAdmin: () => boolean;
    loading: boolean;
    isInitialized: boolean;
    fetchUser: () => Promise<void>;
    setUser: (user: UserResponse) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
    user: null,
    loading: false,
    isInitialized: false,

    isAdmin: () => get().user?.role === 'ADMIN',

    fetchUser: async () => {
        set({loading: true});

        try {
            const user = await userService.currentUser();

            if (user.userBlocked) {
                set({
                    user: null,
                    loading: false,
                    isInitialized: true
                });

                throw {
                    timestamp: new Date().toISOString(),
                    path: '/api/v1/users/me',
                    status: 403,
                    error: 'Forbidden',
                    errorCode: 'ACCOUNT_BLOCKED',
                    message: 'Ваш аккаунт был заблокирован. Обратитесь к администратору.',
                } as ApiError;
            }

            set({
                user,
                loading: false,
                isInitialized: true
            });

        } catch (error) {
            set({
                user: null,
                loading: false,
                isInitialized: true
            });

            throw error;
        }
    },

    setUser: (user: UserResponse) =>
        set({user, isInitialized: true}),

    clearUser: () =>
        set({user: null, isInitialized: true}),
}));