// hooks/useError.ts
import {useCallback, useState} from 'react';
import type {ApiError} from '@/types/auth';
import {toast} from 'sonner';
import {ERROR_CODE_MESSAGES} from "@/locales/ru/errorCodes.ts";

export function useError() {
    const [error, setError] = useState<ApiError | null>(null);

    const handleError = useCallback((err: unknown) => {
        const isApiError = (error: unknown): error is ApiError => {
            return (
                typeof error === 'object' &&
                error !== null &&
                'status' in error &&
                'message' in error
            );
        };

        if (isApiError(err)) {
            let errorMessage = 'Произошла непредвиденная ошибка';

            if (err.errorCode && err.errorCode in ERROR_CODE_MESSAGES) {
                errorMessage = ERROR_CODE_MESSAGES[err.errorCode];
            } else if (err.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
            setError(err);
        } else {
            toast.error('Произошла непредвиденная ошибка');
            setError(null);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {error, handleError, clearError};
}
