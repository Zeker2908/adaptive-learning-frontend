// components/queue/TaskNavigator.tsx
import {Button} from '@/components/ui/button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {cn} from '@/lib/utils';

interface Props {
    onPrevious: () => void;
    onNext: () => void;
    canPrevious: boolean;
    canNext: boolean;
    isLoadingMore?: boolean;
    className?: string;
}

export function TaskNavigator({
                                  onPrevious,
                                  onNext,
                                  canPrevious,
                                  canNext,
                                  isLoadingMore,
                                  className,
                              }: Props) {
    return (
        <div className={cn('flex items-center justify-between py-2', className)}>
            <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!canPrevious}
                className="gap-1"
            >
                <ChevronLeft className="h-4 w-4"/>
                Назад
            </Button>

            <div className="w-20"/>

            <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!canNext || isLoadingMore}
                className="gap-1"
            >
                Вперёд
                <ChevronRight className="h-4 w-4"/>
            </Button>
        </div>
    );
}
