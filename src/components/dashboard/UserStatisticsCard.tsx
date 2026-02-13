import type {TaskStatisticsResponse} from '@/types/solution';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

interface Props {
    statistics: TaskStatisticsResponse | null;
    className?: string;
}


export function UserStatisticsCard({statistics, className}: Props) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Статистика</CardTitle>
                <CardDescription>
                    Общая информация о решениях пользователя
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {!statistics ? (
                    <div className="text-sm text-muted-foreground">
                        Нет данных
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <StatItem
                                label="Всего решений"
                                value={statistics.totalSolutions}
                            />
                            <StatItem
                                label="Успешных решений"
                                value={statistics.successfulSolutions}
                            />
                            <StatItem
                                label="Процент успеха"
                                value={`${statistics.successRate.toFixed(1)}%`}
                            />
                            <StatItem
                                label="Средняя уверенность"
                                value={`${statistics.averageConfidence.toFixed(1)}%`}
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Слабые темы
                            </p>

                            {statistics.weakestTopics.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Нет данных
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {statistics.weakestTopics.map((topic) => (
                                        <Badge
                                            key={topic}
                                            variant="outline"
                                        >
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function StatItem({
                      label,
                      value
                  }: {
    label: string;
    value: string | number;
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
