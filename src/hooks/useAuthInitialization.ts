// hooks/useAuthInitialization.ts
import {useEffect} from 'react';
import {useAuthStore} from '@/store/authStore';
import {useUserStore} from '@/store/userStore';
import {useError} from "@/hooks/useError.ts";

export function useAuthInitialization() {
    const {isAuthenticated, token, clearToken} = useAuthStore();
    const {user, fetchUser, loading} = useUserStore();
    const {handleError} = useError();

    useEffect(() => {
        if (token && !user && !loading && isAuthenticated) {
            fetchUser()
                .catch((error) => {
                    clearToken();
                    handleError(error);
                });
        }
    }, [isAuthenticated, token, user, loading, fetchUser, clearToken, handleError]);
}