// components/dashboard/ProgressCard.tsx
import {useEffect, useRef} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import type {UserProgressResponse} from '@/types/solution';

interface Props {
    data: UserProgressResponse[];
    isLoading: boolean;
    isLast: boolean;
    hasError: boolean; // Новый пропс
    onLoadMore: () => void;
    onRetry: () => void; // Новый пропс
}

export function ProgressCard({
                                 data,
                                 isLoading,
                                 isLast,
                                 hasError,
                                 onLoadMore,
                                 onRetry,
                             }: Props) {

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loadMoreRef.current || !scrollContainerRef.current || isLast || hasError) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [onLoadMore, isLast, hasError]);

    return (
        <Card className="h-80 flex flex-col">
            <CardHeader>
                <CardTitle>Прогресс</CardTitle>
                <CardDescription>
                    Темы и уровень уверенности
                </CardDescription>
            </CardHeader>

            <CardContent
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto space-y-3"
            >
                {data.map(item => (
                    <ProgressItem key={item.id} item={item}/>
                ))}

                <div ref={loadMoreRef} className="h-1"/>

                {isLoading && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                        Загрузка…
                    </div>
                )}

                {hasError && (
                    <div className="text-center py-4">
                        <p className="text-sm text-destructive mb-2">
                            Не удалось загрузить данные
                        </p>
                        <button
                            onClick={onRetry}
                            className="text-sm text-primary hover:underline"
                        >
                            Повторить
                        </button>
                    </div>
                )}

                {!isLoading && !hasError && data.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        Пока нет данных
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function getConfidenceLevel(confidence: number) {
    if (confidence < 0.35) return {label: 'Низкая', color: 'bg-red-500'};
    if (confidence < 0.6) return {label: 'Средняя', color: 'bg-yellow-500'};
    if (confidence < 0.8) return {label: 'Хорошая', color: 'bg-blue-500'};
    return {label: 'Отличная', color: 'bg-green-500'};
}


function ProgressItem({item}: { item: UserProgressResponse }) {
    const percent = Math.round(item.confidence * 100);
    const level = getConfidenceLevel(item.confidence);

    return (
        <div className="rounded-lg border p-3 space-y-2">
            <div className="flex justify-between items-center">
                <p className="font-medium">{item.topic}</p>
                <span className="text-sm text-muted-foreground">
                    {level.label}
                </span>
            </div>

            <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all ${level.color}`}
                    style={{width: `${percent}%`}}
                />
            </div>

            <div className="text-xs text-muted-foreground text-right">
                {percent}%
            </div>
        </div>
    );
}