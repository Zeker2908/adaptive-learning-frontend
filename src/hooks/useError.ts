// hooks/useError.ts
import {useCallback, useState} from 'react';
import type {ApiError} from '@/types/auth';
import {toast} from 'sonner';

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
            toast.error(err.message || 'An error occurred');
            setError(err);
        } else {
            toast.error('An unexpected error occurred');
            setError(null);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {error, handleError, clearError};
}
