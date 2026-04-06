// components/admin/tasks/TaskContentForm.tsx

import {useState} from 'react';
import {
    type CodingTaskContent,
    isTaskType,
    type MultipleChoiceTaskContent,
    type SingleChoiceTaskContent,
    TASK_TYPES,
    type TaskContent,
    type TaskType
} from '@/types/task';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';

interface Props {
    onChange: (content: TaskContent) => void;
}

export function TaskContentForm({onChange}: Props) {
    const [type, setType] = useState<TaskType>('CODING');

    const [coding, setCoding] = useState<CodingTaskContent>({
        type: 'CODING',
        templateCode: '',
        testCases: []
    });

    const [single, setSingle] = useState<SingleChoiceTaskContent>({
        type: 'SINGLE_CHOICE',
        question: '',
        options: [],
        correctOptionIndex: 0
    });

    const [multiple, setMultiple] = useState<MultipleChoiceTaskContent>({
        type: 'MULTIPLE_CHOICE',
        question: '',
        options: [],
        correctOptionIndices: []
    });
    return (
        <div className="space-y-4">
            <select
                className="w-full border rounded p-2"
                value={type}
                onChange={(e) => {
                    const value = e.target.value;
                    if (isTaskType(value)) setType(value);
                }}
            >
                {TASK_TYPES.map(t => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                ))}
            </select>

            {/* CODING */}
            {type === 'CODING' && (
                <>
                    <Textarea
                        placeholder="Template code"
                        onChange={e => {
                            const updated = {...coding, templateCode: e.target.value};
                            setCoding(updated);
                            onChange(updated);
                        }}
                    />

                    <Button
                        onClick={() => {
                            const updated = {
                                ...coding,
                                testCases: [...coding.testCases, {input: '', output: ''}]
                            };
                            setCoding(updated);
                            onChange(updated);
                        }}
                    >
                        Добавить тест
                    </Button>

                    {coding.testCases.map((_tc, i) => (
                        <div key={i} className="flex gap-2">
                            <Input
                                placeholder="Input"
                                onChange={e => {
                                    const updated = {...coding};
                                    updated.testCases[i].input = e.target.value;
                                    setCoding(updated);
                                    onChange(updated);
                                }}
                            />
                            <Input
                                placeholder="Output"
                                onChange={e => {
                                    const updated = {...coding};
                                    updated.testCases[i].output = e.target.value;
                                    setCoding(updated);
                                    onChange(updated);
                                }}
                            />
                        </div>
                    ))}
                </>
            )}

            {/* SINGLE */}
            {type === 'SINGLE_CHOICE' && (
                <>
                    <Input
                        placeholder="Question"
                        onChange={e => {
                            const updated = {...single, question: e.target.value};
                            setSingle(updated);
                            onChange(updated);
                        }}
                    />
                </>
            )}

            {/* MULTIPLE */}
            {type === 'MULTIPLE_CHOICE' && (
                <>
                    <Input
                        placeholder="Question"
                        onChange={e => {
                            const updated = {...multiple, question: e.target.value};
                            setMultiple(updated);
                            onChange(updated);
                        }}
                    />
                </>
            )}
        </div>
    );
}