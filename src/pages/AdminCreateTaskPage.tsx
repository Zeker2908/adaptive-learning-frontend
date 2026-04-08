// pages/admin/AdminCreateTaskPage.tsx

import {useState} from 'react';
import {RootLayout} from '@/components/layout/RootLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {taskService} from '@/services/taskService';
import {useError} from '@/hooks/useError';
import {ArrowLeft, FilePlus} from 'lucide-react';
import type {TaskRequest} from '@/types/task';
import {TaskForm} from "@/components/admin/task/TaskForm.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {toast} from 'sonner';

export default function AdminCreateTaskPage() {
    const {handleError} = useError();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (data: TaskRequest) => {
        try {
            setIsLoading(true);
            await taskService.createTask(data);
            toast.success('Задача успешно создана!');
            navigate('/admin/tasks'); // редирект назад к списку
        } catch (e) {
            handleError(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RootLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="space-y-4">
                    {/* Назад */}
                    <div className="-ml-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                        </Button>
                    </div>

                    {/* Заголовок */}
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <FilePlus className="h-8 w-8"/>
                            Создание задачи
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Создайте новую задачу для платформы
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Новая задача</CardTitle>
                        <CardDescription>
                            Заполните данные задачи и выберите тип контента
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <TaskForm onSubmit={handleSubmit} isLoading={isLoading}/>
                    </CardContent>
                </Card>
            </div>
        </RootLayout>
    );
}