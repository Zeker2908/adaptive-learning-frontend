import {useCallback, useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {taskService} from '@/services/taskService';
import {useError} from '@/hooks/useError';
import {FileCode, Plus} from 'lucide-react';
import {RootLayout} from '@/components/layout/RootLayout';
import {TasksTable} from '@/components/admin/task/TasksTable.tsx';
import type {TaskResponse} from '@/types/task.ts';
import type {Page} from "@/types/page.ts";
import {Button} from '@/components/ui/button.tsx';
import {useNavigate} from 'react-router-dom';

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Page<TaskResponse>>({
        content: [],
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
        size: 20,
        number: 0,
        numberOfElements: 0,
        empty: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const {handleError} = useError();
    const navigate = useNavigate();

    // Filters
    const [titleFilter, setTitleFilter] = useState('');        // Для API (дебансированный)
    const [titleInput, setTitleInput] = useState('');           // Для инпута (мгновенный)
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Pagination & Sorting
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(0);
    const sizeRef = 20;

    // 🔹 Debounce: обновляем titleFilter только после паузы в 400мс
    useEffect(() => {
        const handler = setTimeout(() => {
            setTitleFilter(titleInput);
            setPage(0); // сброс на первую страницу при новом поиске
        }, 400);

        return () => clearTimeout(handler); // очистка таймера при новом вводе
    }, [titleInput]);

    const loadTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await taskService.getTasks({
                page,
                size: sizeRef,
                title: titleFilter.trim() || undefined, // ✅ используем дебансированное значение
                difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                sortField,
                sortDirection,
            });
            setTasks(response);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError, page, sortField, sortDirection, titleFilter, selectedDifficulties, selectedTags]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // 🔹 Сброс фильтров (включая инпут)
    const clearFilters = () => {
        setTitleInput('');
        setTitleFilter('');
        setSelectedDifficulties([]);
        setSelectedTags([]);
        setPage(0);
    };

    // Сброс страницы при изменении фильтров (кроме поиска — он уже сбрасывается в debounce)
    useEffect(() => {
        setPage(0);
    }, [selectedDifficulties, selectedTags]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks, page]);

    const handleActionComplete = () => {
        loadTasks();
    };

    return (
        <RootLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <FileCode className="h-8 w-8"/>
                            Управление задачами
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Создание, редактирование и модерация задач платформы
                        </p>
                    </div>
                    <Button onClick={() => navigate('/admin/tasks/create')} className="gap-2">
                        <Plus className="h-4 w-4"/>
                        Создать задачу
                    </Button>
                </div>

                {/* Tasks List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCode className="h-5 w-5"/>
                            Все задачи
                        </CardTitle>
                        <CardDescription>
                            Фильтруйте, сортируйте и управляйте задачами. Кликните на задачу для редактирования.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                                    <p className="text-muted-foreground">Загрузка задач...</p>
                                </div>
                            </div>
                        ) : (
                            <TasksTable
                                tasks={tasks.content}
                                titleFilter={titleInput}
                                onTitleFilterChange={setTitleInput}
                                selectedDifficulties={selectedDifficulties}
                                onDifficultiesChange={setSelectedDifficulties}
                                selectedTags={selectedTags}
                                onTagsChange={setSelectedTags}
                                onActionComplete={handleActionComplete}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                page={page}
                                onPageChange={setPage}
                                totalPages={tasks.totalPages}
                                totalElements={tasks.totalElements}
                                first={tasks.first}
                                last={tasks.last}
                                hasActiveFilters={!!titleFilter.trim() || selectedDifficulties.length > 0 || selectedTags.length > 0}
                                onClearFilters={clearFilters} // ✅ передаём обработчик сброса
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </RootLayout>
    );
}