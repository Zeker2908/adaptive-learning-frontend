// store/userStore.ts
import {create} from 'zustand';
import {userService} from '@/services/userService';
import type {UserResponse} from "@/types/user.ts";

interface UserState {
    user: UserResponse | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
    user: null,
    loading: false,

    fetchUser: async () => {
        set({loading: true});
        try {
            const user = await userService.currentUser();
            set({user, loading: false});
        } catch (error) {
            set({user: null, loading: false});
            throw error;
        }
    },

    clearUser: () => set({user: null}),
}));