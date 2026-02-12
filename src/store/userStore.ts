// store/userStore.ts
import {create} from 'zustand';
import {userService} from '@/services/userService';
import type {UserResponse} from "@/types/user.ts";
import type {ApiError} from "@/types/auth.ts";

interface UserState {
    user: UserResponse | null;
    isAdmin: () => boolean;
    loading: boolean;
    fetchUser: () => Promise<void>;
    setUser: (user: UserResponse) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({  // ← Добавили get
    user: null,
    loading: false,

    isAdmin: () => {
        return get().user?.role === 'ADMIN';
    },

    fetchUser: async () => {
        set({loading: true});
        try {
            const user = await userService.currentUser();

            if (user.userBlocked) {
                set({user: null, loading: false});
                throw {
                    timestamp: new Date().toISOString(),
                    path: '/api/v1/users/me',
                    status: 403,
                    error: 'Forbidden',
                    errorCode: 'ACCOUNT_BLOCKED',
                    message: 'Ваш аккаунт был заблокирован. Обратитесь к администратору.',
                } as ApiError;
            }

            set({user, loading: false});
        } catch (error) {
            set({user: null, loading: false});
            throw error;
        }
    },

    setUser: (user: UserResponse) => set({user}),

    clearUser: () => set({user: null}),
}));