import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {RootLayout} from '@/components/layout/RootLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {taskService} from '@/services/taskService';
import {useError} from '@/hooks/useError';
import {ArrowLeft, Pencil} from 'lucide-react';
import type {TaskRequest, TaskResponse} from '@/types/task';
import {TaskForm} from '@/components/admin/task/TaskForm';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';

function toTaskRequest(task: TaskResponse): TaskRequest {
    return {
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        tags: task.tags ?? [],
        content: task.content,
    };
}

export default function AdminEditTaskPage() {
    const {taskId} = useParams<{ taskId: string }>();
    const {handleError} = useError();
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!taskId) {
            return;
        }

        const loadTask = async () => {
            try {
                setIsLoading(true);
                const loadedTask = await taskService.getTaskById(taskId);
                setTask(loadedTask);
            } catch (error) {
                handleError(error);
                navigate('/admin/tasks');
            } finally {
                setIsLoading(false);
            }
        };

        void loadTask();
    }, [taskId, handleError, navigate]);

    const handleSubmit = async (data: TaskRequest) => {
        if (!taskId) {
            return;
        }

        try {
            setIsSaving(true);
            await taskService.updateTask(taskId, data);
            toast.success('Задача обновлена');
            navigate('/admin/tasks');
        } catch (error) {
            handleError(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <RootLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="space-y-4">
                    <div className="-ml-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/admin/tasks')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                        </Button>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Pencil className="h-8 w-8"/>
                            Редактирование задачи
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Измените условие, теги или содержимое задачи
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{task?.title ?? 'Загрузка...'}</CardTitle>
                        <CardDescription>
                            {taskId && (
                                <span className="font-mono text-xs">{taskId}</span>
                            )}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="py-12 text-center text-muted-foreground">
                                Загрузка задачи...
                            </div>
                        ) : task ? (
                            <TaskForm
                                key={task.id}
                                mode="edit"
                                initialData={toTaskRequest(task)}
                                onSubmit={handleSubmit}
                                isLoading={isSaving}
                            />
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </RootLayout>
    );
}
