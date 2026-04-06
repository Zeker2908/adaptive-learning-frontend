import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import {ArrowDown, ArrowUp, Code2, Edit, MoreVertical, Trash2, CircleCheck, CircleDot, X} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Input} from '@/components/ui/input.tsx';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {useError} from '@/hooks/useError.ts';
import type {TaskResponse, TaskType} from '@/types/task.ts';
import {Checkbox} from '@/components/ui/checkbox.tsx';
import {adminService} from "@/services/adminService.ts";

// Доступные значения для фильтров
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;

interface TasksTableProps {
    tasks: TaskResponse[];

    // Filters
    titleFilter: string;
    onTitleFilterChange: (value: string) => void;
    selectedDifficulties: string[];
    onDifficultiesChange: (values: string[]) => void;
    selectedTags: string[];
    onTagsChange: (values: string[]) => void;

    onActionComplete: () => void;

    // Sorting
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;

    // Pagination
    page: number;
    onPageChange: (page: number) => void;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
}

export function TasksTable({
                               tasks,
                               titleFilter,
                               onTitleFilterChange,
                               selectedDifficulties,
                               onDifficultiesChange,
                               selectedTags,
                               onTagsChange,
                               onActionComplete,
                               sortField,
                               sortDirection,
                               onSort,
                               page,
                               onPageChange,
                               totalPages,
                               totalElements,
                               first,
                               last,
                           }: TasksTableProps) {
    const {handleError} = useError();
    const navigate = useNavigate();

    // =========================
    // Actions
    // =========================

    const handleDeleteTask = async (taskId: string, title: string) => {
        if (!confirm(`Удалить задачу "${title}"? Это действие нельзя отменить.`)) {
            return;
        }
        try {
            await adminService.deleteTask(taskId);
            toast.success('Задача удалена');
            onActionComplete();
        } catch (error) {
            handleError(error);
        }
    };

    // =========================
    // Filter handlers
    // =========================

    const toggleDifficulty = (difficulty: string) => {
        onDifficultiesChange(
            selectedDifficulties.includes(difficulty)
                ? selectedDifficulties.filter(d => d !== difficulty)
                : [...selectedDifficulties, difficulty]
        );
    };

    // 🔹 Удаление тега из фильтра (клик по выбранному тегу)
    const removeTagFilter = (tag: string) => {
        onTagsChange(selectedTags.filter(t => t !== tag));
    };

    // 🔹 Добавление/удаление тега при клике по тегу в таблице
    const toggleTagFromTable = (tag: string) => {
        if (selectedTags.includes(tag)) {
            // Если уже в фильтре — убираем (toggle-поведение)
            removeTagFilter(tag);
        } else {
            // Добавляем новый тег
            onTagsChange([...selectedTags, tag]);
        }
    };

    const clearFilters = () => {
        onTitleFilterChange('');
        onDifficultiesChange([]);
        onTagsChange([]);
    };

    const hasActiveFilters = titleFilter.trim() || selectedDifficulties.length > 0 || selectedTags.length > 0;

    // =========================
    // Sorting icon
    // =========================

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>;
    };

    // =========================
    // Badge variants
    // =========================

    const getDifficultyVariant = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'HARD':
                return 'bg-red-100 text-red-800 hover:bg-red-100';
            default:
                return 'outline';
        }
    };

    const getTypeConfig = (type: TaskType) => {
        switch (type) {
            case 'CODING':
                return {
                    label: 'Код',
                    icon: <Code2 className="h-3 w-3 mr-1 inline"/>,
                    variant: 'bg-blue-100 text-blue-800 hover:bg-blue-100' as const,
                };
            case 'MULTIPLE_CHOICE':
                return {
                    label: 'Множ. выбор',
                    icon: <CircleCheck className="h-3 w-3 mr-1 inline"/>,
                    variant: 'bg-purple-100 text-purple-800 hover:bg-purple-100' as const,
                };
            case 'SINGLE_CHOICE':
                return {
                    label: 'Один выбор',
                    icon: <CircleDot className="h-3 w-3 mr-1 inline"/>,
                    variant: 'bg-pink-100 text-pink-800 hover:bg-pink-100' as const,
                };
        }
    };

    // =========================
    // Render
    // =========================

    return (
        <div className="rounded-md border">

            {/* 🔎 Filters */}
            <div className="p-4 border-b space-y-4">
                {/* Title search */}
                <div className="flex gap-3">
                    <Input
                        placeholder="Поиск по названию..."
                        value={titleFilter}
                        onChange={(e) => onTitleFilterChange(e.target.value)}
                        className="max-w-sm"
                    />
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Сбросить
                        </Button>
                    )}
                </div>

                {/* 🔹 Активные теги-фильтры (отображаются только выбранные) */}
                {selectedTags.length > 0 && (
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium text-muted-foreground">Фильтр по тегам:</span>
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="default"
                                    className="cursor-pointer gap-1 pr-1 hover:opacity-90"
                                    onClick={() => removeTagFilter(tag)}
                                    title="Нажми, чтобы убрать из фильтра"
                                >
                                    {tag}
                                    <X className="h-3 w-3 opacity-70"/>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Difficulty filter */}
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">Сложность:</span>
                    {DIFFICULTIES.map((diff) => (
                        <label key={diff} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={selectedDifficulties.includes(diff)}
                                onCheckedChange={() => toggleDifficulty(diff)}
                            />
                            <Badge variant="outline" className={getDifficultyVariant(diff)}>
                                {diff === 'EASY' ? 'Лёгкая' : diff === 'MEDIUM' ? 'Средняя' : 'Сложная'}
                            </Badge>
                        </label>
                    ))}
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSort('title')}
                        >
                            <div className="flex items-center gap-1">
                                Название
                                {renderSortIcon('title')}
                            </div>
                        </TableHead>

                        {/* Тип контента */}
                        <TableHead>Тип</TableHead>

                        <TableHead>Сложность</TableHead>
                        <TableHead>Теги</TableHead>

                    </TableRow>
                </TableHeader>

                <TableBody>
                    {tasks.map((task) => {
                        const typeConfig = getTypeConfig(task.content.type);
                        return (
                            <TableRow
                                key={task.id}
                                className="hover:bg-muted/50 cursor-pointer transition-colors"
                                // onClick={() => navigate(`/admin/tasks/${task.id}`)}
                            >
                                {/* Title */}
                                <TableCell className="font-medium">
                                    <div>
                                        <div>{task.title}</div>
                                        <div
                                            className="text-xs text-muted-foreground font-mono"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(task.id)
                                                    .then(() => toast.success('ID скопирован!'))
                                                    .catch(() => toast.error('Не удалось скопировать'));
                                            }}
                                        >
                                            {task.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Тип контента */}
                                <TableCell>
                                    <Badge variant="outline" className={typeConfig.variant}>
                                        {typeConfig.icon}
                                        {typeConfig.label}
                                    </Badge>
                                </TableCell>

                                {/* Difficulty */}
                                <TableCell>
                                    <Badge variant="outline" className={getDifficultyVariant(task.difficulty)}>
                                        {task.difficulty === 'EASY' ? 'Лёгкая' : task.difficulty === 'MEDIUM' ? 'Средняя' : 'Сложная'}
                                    </Badge>
                                </TableCell>

                                {/* 🔹 Теги — кликабельные */}
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {task.tags?.slice(0, 5).map((tag) => {
                                            const isSelected = selectedTags.includes(tag);
                                            return (
                                                <Badge
                                                    key={tag}
                                                    variant={isSelected ? 'default' : 'secondary'}
                                                    className={`text-xs cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'ring-2 ring-primary ring-offset-1'
                                                            : 'hover:ring-2 hover:ring-muted-foreground/30'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // чтобы не открывалась задача
                                                        toggleTagFromTable(tag);
                                                    }}
                                                    title={isSelected
                                                        ? 'Нажми, чтобы убрать из фильтра'
                                                        : 'Нажми, чтобы фильтровать по этому тегу'
                                                    }
                                                >
                                                    {tag}
                                                </Badge>
                                            );
                                        })}
                                        {task.tags && task.tags.length > 5 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{task.tags.length - 5}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 hover:bg-muted rounded-full"
                                            >
                                                <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/tasks/${task.id}`);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-2"/>
                                                Редактировать
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTask(task.id, task.title);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2"/>
                                                Удалить
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                {hasActiveFilters ? 'По фильтрам ничего не найдено' : 'Задачи отсутствуют'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                    Страница {page + 1} из {totalPages} • Всего задач: {totalElements}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={first} onClick={() => onPageChange(page - 1)}>
                        Назад
                    </Button>
                    <Button variant="outline" size="sm" disabled={last} onClick={() => onPageChange(page + 1)}>
                        Вперёд
                    </Button>
                </div>
            </div>
        </div>
    );
}