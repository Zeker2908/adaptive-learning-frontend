// components/queue/SubmissionStatus.tsx
import {AlertCircle, CheckCircle2, Loader2, XCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {SolutionStatus, SolutionStatusLabels} from '@/types/solution';
import type {JSX} from "react";

interface Props {
    status: SolutionStatus | null;
    feedback: string;
    isLoading: boolean;
    className?: string;
}

const statusConfig: Record<SolutionStatus, { icon: JSX.Element; variant: string }> = {
    PENDING: {
        icon: <Loader2 className="h-4 w-4 animate-spin"/>,
        variant: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    SUCCESS: {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600"/>,
        variant: 'bg-green-50 border-green-200 text-green-800'
    },
    FAILED: {
        icon: <XCircle className="h-4 w-4 text-red-600"/>,
        variant: 'bg-red-50 border-red-200 text-red-800'
    },
    SERVICE_UNAVAILABLE: {
        icon: <AlertCircle className="h-4 w-4 text-orange-600"/>,
        variant: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    TIMEOUT: {
        icon: <AlertCircle className="h-4 w-4 text-yellow-600"/>,
        variant: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
};

export function SubmissionStatus({status, feedback, isLoading, className}: Props) {
    if (!status && !isLoading) return null;

    const config = status ? statusConfig[status] : statusConfig.PENDING;
    const label = status ? SolutionStatusLabels[status] : 'Отправка...';

    return (
        <div className={cn('p-3 rounded-md border text-sm space-y-1', config.variant, className)}>
            <div className="flex items-center gap-2 font-medium">
                {config.icon}
                <span>{label}</span>
            </div>
            {feedback && (
                <pre className="whitespace-pre-wrap font-mono text-xs mt-1 pl-6">{feedback}</pre>
            )}
        </div>
    );
}