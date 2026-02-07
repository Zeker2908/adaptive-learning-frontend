// hooks/useToast.ts
import { toast } from 'sonner';
import { useError } from '@/hooks/useError.ts';

export const useToast = () => {
    const { handleError } = useError();

    const showSuccessToast = (
        action: () => void,
        message: string,
        final?: () => void
    ) => {
        return () => {
            try {
                action();
                toast.success(message);
            } catch (error) {
                handleError(error);
            } finally {
                final?.();
            }
        };
    };

    return { showSuccessToast };
};
