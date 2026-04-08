// components/queue/TaskDescription.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {CodingTaskContent, TaskResponse} from '@/types/task';

interface Props {
    task: TaskResponse;
}

export function TaskDescription({ task }: Props) {
    const content = task.content as CodingTaskContent;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{task.title}</span>
                    <Badge variant={
                        task.difficulty === 'EASY' ? 'default' :
                            task.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                    }>
                        {task.difficulty}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Описание / инструкция */}
                <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                        {task.description}
                    </p>
                </div>

                {/* Теги */}
                {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {task.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Тест-кейсы */}
                {content.testCases?.length > 0 && (
                    <details className="border rounded p-3 bg-muted/30">
                        <summary className="cursor-pointer font-medium text-sm">
                            🧪 Примеры тестов ({content.testCases.length})
                        </summary>
                        <div className="mt-3 space-y-3 text-sm">
                            {content.testCases.slice(0, 3).map((tc: any, i: number) => (
                                <div key={i} className="p-2 bg-background rounded border space-y-1">
                                    <div className="text-xs text-muted-foreground font-medium">Пример #{i + 1}</div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Input:</span>
                                        <pre className="whitespace-pre-wrap font-mono text-xs mt-1">{tc.input}</pre>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Expected:</span>
                                        <pre className="whitespace-pre-wrap font-mono text-xs mt-1">{tc.output}</pre>
                                    </div>
                                </div>
                            ))}
                            {content.testCases.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                    +{content.testCases.length - 3} скрытых тестов
                                </div>
                            )}
                        </div>
                    </details>
                )}
            </CardContent>
        </Card>
    );
}