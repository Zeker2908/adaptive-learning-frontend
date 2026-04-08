// components/queue/TaskNavigator.tsx
import {Button} from '@/components/ui/button';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface Props {
    currentIndex: number;
    totalTasks: number;
    onPrevious: () => void;
    onNext: () => void;
    canPrevious: boolean;
    canNext: boolean;
    isLoadingMore?: boolean;
}

export function TaskNavigator({
                                  currentIndex,
                                  totalTasks,
                                  onPrevious,
                                  onNext,
                                  canPrevious,
                                  canNext,
                                  isLoadingMore,
                              }: Props) {
    return (
        <div className="flex items-center justify-between py-2">
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

            <span className="text-sm text-muted-foreground">
        Задача {currentIndex + 1} из {totalTasks}
                {isLoadingMore && <span className="ml-2 text-xs text-primary">• загрузка...</span>}
      </span>

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
