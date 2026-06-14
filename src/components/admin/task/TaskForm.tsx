import {useState} from 'react';
import type {Difficulty, TaskContent, TaskRequest} from '@/types/task';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {TaskContentForm} from './TaskContentForm';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

interface Props {
    onSubmit: (data: TaskRequest) => void;
    isLoading: boolean;
    initialData?: Partial<TaskRequest>;
    mode?: 'create' | 'edit';
}

export function TaskForm({onSubmit, isLoading, initialData, mode = 'create'}: Props) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || 'EASY');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

    const createDefaultContent = (): TaskContent => ({
        type: 'CODING',
        templateCode: '',
        testCases: [{input: '', output: ''}]
    });

    const [content, setContent] = useState<TaskContent>(
        initialData?.content || createDefaultContent()
    );


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !title.trim()) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            difficulty,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            content
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                    id="title"
                    placeholder="Например: Сумма двух чисел"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                    id="description"
                    placeholder="Опишите условие задачи..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label>Сложность</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите сложность"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EASY">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"/>
                            Лёгкая
                          </span>
                        </SelectItem>

                        <SelectItem value="MEDIUM">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"/>
                            Средняя
                          </span>
                        </SelectItem>

                        <SelectItem value="HARD">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"/>
                            Сложная
                          </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Теги</Label>
                <Input
                    id="tags"
                    placeholder="arrays, strings, dp (через запятую)"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Пример: <code>arrays, sorting, easy</code>
                </p>
            </div>

            <div className="pt-4 border-t">
                <TaskContentForm
                    value={content}
                    onChange={setContent}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading || !content || !title.trim()}>
                    {mode === 'edit'
                        ? (isLoading ? 'Сохранение...' : 'Сохранить изменения')
                        : (isLoading ? 'Создание...' : 'Создать задачу')}
                </Button>
            </div>
        </form>
    );
}