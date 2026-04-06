// components/admin/tasks/TaskForm.tsx

import {useState} from 'react';
import type {Difficulty, TaskContent, TaskRequest} from '@/types/task';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {TaskContentForm} from './TaskContentForm';

interface Props {
    onSubmit: (data: TaskRequest) => void;
    isLoading: boolean;
}

export function TaskForm({onSubmit, isLoading}: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    const [tags, setTags] = useState<string>('');
    const [content, setContent] = useState<TaskContent | null>(null);

    const handleSubmit = () => {
        if (!content) return;

        onSubmit({
            title,
            description,
            difficulty,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            content
        });
    };

    return (
        <div className="space-y-6">
            <Input
                placeholder="Название задачи"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            <Textarea
                placeholder="Описание"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />

            <select
                className="w-full border rounded p-2"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
            >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
            </select>

            <Input
                placeholder="Теги (через запятую)"
                value={tags}
                onChange={e => setTags(e.target.value)}
            />

            <TaskContentForm onChange={setContent}/>

            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Создание...' : 'Создать задачу'}
            </Button>
        </div>
    );
}