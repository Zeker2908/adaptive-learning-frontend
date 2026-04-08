// components/queue/TaskDescription.tsx
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import type {CodingTaskContent, TaskResponse} from '@/types/task';

interface Props {
    task: TaskResponse;
}

export function TaskDescription({task}: Props) {
    // 🔹 Для choice-задач вопрос берётся из content
    const question = task.content.type !== 'CODING'
        ? task.content.question
        : null;

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
                {/* 🔹 Вопрос для choice-задач */}
                {question && (
                    <div className="p-3 bg-muted/30 rounded-md border">
                        <p className="text-sm font-medium">{question}</p>
                    </div>
                )}

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

                {/* Тест-кейсы только для CODING */}
                {task.content.type === 'CODING' && (
                    <CodingTestCases content={task.content as CodingTaskContent}/>
                )}

            </CardContent>
        </Card>
    );
}

function CodingTestCases({content}: { content: CodingTaskContent }) {
    if (!content.testCases?.length) return null;

    return (
        <details className="border rounded p-3 bg-muted/30">
            <summary className="cursor-pointer font-medium text-sm">
                🧪 Примеры тестов
            </summary>
            <div className="mt-3 space-y-3 text-sm">
                {content.testCases.slice(0, 1).map((tc, i) => (
                    <div key={i} className="p-2 bg-background rounded border space-y-1">

                        <div>
                            <span className="text-xs text-muted-foreground">Input:</span>
                            <pre className="whitespace-pre-wrap font-mono text-xs mt-1">
                                {tc.input}
                            </pre>
                        </div>

                        <div>
                            <span className="text-xs text-muted-foreground">Expected:</span>
                            <pre className="whitespace-pre-wrap font-mono text-xs mt-1">
                                {tc.output}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        </details>
    );
}