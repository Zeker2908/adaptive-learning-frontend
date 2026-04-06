import {useState, useCallback} from 'react';
import {
    type CodingTaskContent,
    type MultipleChoiceTaskContent,
    type SingleChoiceTaskContent,
    TASK_TYPES,
    type TaskContent,
    type TaskType,
    type ChoiceOption
} from '@/types/task';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Trash2, Plus, CircleCheck, CircleDot, Code2} from 'lucide-react';

interface Props {
    value: TaskContent | null;
    onChange: (content: TaskContent) => void;
}

// 🔹 Helpers: фабричные функции для чистого состояния каждого типа
const createCodingContent = (): CodingTaskContent => ({
    type: 'CODING',
    templateCode: '',
    testCases: [{input: '', output: ''}]
});

const createSingleChoiceContent = (): SingleChoiceTaskContent => ({
    type: 'SINGLE_CHOICE',
    question: '',
    options: [{text: '', explanation: ''}],
    correctOptionIndex: 0
});

const createMultipleChoiceContent = (): MultipleChoiceTaskContent => ({
    type: 'MULTIPLE_CHOICE',
    question: '',
    options: [{text: '', explanation: ''}, {text: '', explanation: ''}],
    correctOptionIndices: []
});

export function TaskContentForm({value, onChange}: Props) {
    // 🔹 Единый стейт для типа + контента
    const [type, setType] = useState<TaskType>(value?.type || 'CODING');

    // 🔹 При маунте или смене value снаружи — синхронизируем type
    useState(() => {
        if (value?.type && value.type !== type) {
            setType(value.type);
        }
    });

    // 🔹 При смене типа — сбрасываем контент в дефолтное состояние
    const handleTypeChange = useCallback((newType: TaskType) => {
        setType(newType);
        switch (newType) {
            case 'CODING':
                onChange(createCodingContent());
                break;
            case 'SINGLE_CHOICE':
                onChange(createSingleChoiceContent());
                break;
            case 'MULTIPLE_CHOICE':
                onChange(createMultipleChoiceContent());
                break;
        }
    }, [onChange]);

    // =========================
    // CODING task handlers
    // =========================

    const handleCodingChange = <K extends keyof CodingTaskContent>(
        field: K,
        fieldValue: CodingTaskContent[K]  // ← переименовали, чтобы не путать с prop `value`
    ) => {
        if (!value || value.type !== 'CODING') return;
        onChange({ ...value, [field]: fieldValue });
    };

    const addTestCase = () => {
        if (!value || value.type !== 'CODING') return;
        onChange({
            ...value,
            testCases: [...value.testCases, {input: '', output: ''}]
        });
    };

    const updateTestCase = (index: number, field: 'input' | 'output', val: string) => {
        if (!value || value.type !== 'CODING') return;
        const newCases = [...value.testCases];
        newCases[index] = {...newCases[index], [field]: val};
        onChange({...value, testCases: newCases});
    };

    const removeTestCase = (index: number) => {
        if (!value || value.type !== 'CODING') return;
        if (value.testCases.length <= 1) return; // минимум один тест
        const newCases = value.testCases.filter((_, i) => i !== index);
        onChange({...value, testCases: newCases});
    };

    // =========================
    // Choice tasks helpers
    // =========================

    const handleQuestionChange = (question: string) => {
        if (!value || (value.type !== 'SINGLE_CHOICE' && value.type !== 'MULTIPLE_CHOICE')) return;
        onChange({...value, question});
    };

    const addOption = () => {
        if (!value || (value.type !== 'SINGLE_CHOICE' && value.type !== 'MULTIPLE_CHOICE')) return;
        const newOption: ChoiceOption = {text: '', explanation: ''};
        if (value.type === 'SINGLE_CHOICE') {
            onChange({
                ...value,
                options: [...value.options, newOption]
            });
        } else {
            onChange({
                ...value,
                options: [...value.options, newOption]
            });
        }
    };

    const updateOption = (index: number, field: keyof ChoiceOption, val: string) => {
        if (!value || (value.type !== 'SINGLE_CHOICE' && value.type !== 'MULTIPLE_CHOICE')) return;
        const newOptions = [...value.options];
        newOptions[index] = {...newOptions[index], [field]: val};
        onChange({...value, options: newOptions});
    };

    const removeOption = (index: number) => {
        if (!value || (value.type !== 'SINGLE_CHOICE' && value.type !== 'MULTIPLE_CHOICE')) return;
        if (value.options.length <= 1) return;

        if (value.type === 'SINGLE_CHOICE') {
            const newOptions = value.options.filter((_, i) => i !== index);
            let newCorrect = value.correctOptionIndex;
            if (index === value.correctOptionIndex) {
                newCorrect = Math.max(0, newOptions.length - 1);
            } else if (index < value.correctOptionIndex) {
                newCorrect--;
            }
            onChange({...value, options: newOptions, correctOptionIndex: newCorrect});
        } else {
            const newOptions = value.options.filter((_, i) => i !== index);
            const newCorrect = value.correctOptionIndices
                .filter(i => i !== index)
                .map(i => i > index ? i - 1 : i);
            onChange({...value, options: newOptions, correctOptionIndices: newCorrect});
        }
    };

    // =========================
    // SINGLE_CHOICE handlers
    // =========================

    const handleSingleCorrectChange = (index: number) => {
        if (!value || value.type !== 'SINGLE_CHOICE') return;
        onChange({...value, correctOptionIndex: index});
    };

    // =========================
    // MULTIPLE_CHOICE handlers
    // =========================

    const handleMultipleCorrectToggle = (index: number) => {
        if (!value || value.type !== 'MULTIPLE_CHOICE') return;
        const current = value.correctOptionIndices;
        const newCorrect = current.includes(index)
            ? current.filter(i => i !== index)
            : [...current, index];
        onChange({...value, correctOptionIndices: newCorrect});
    };

    // =========================
    // Render
    // =========================

    return (
        <div className="space-y-6">
            {/* 🔹 Selector типа задачи */}
            <div className="space-y-2">
                <Label>Тип</Label>
                <div className="flex gap-2">
                    {TASK_TYPES.map((t) => {
                        const isActive = type === t;
                        const config = {
                            CODING: {label: 'Код', icon: <Code2 className="h-4 w-4"/>},
                            SINGLE_CHOICE: {label: 'Один ответ', icon: <CircleDot className="h-4 w-4"/>},
                            MULTIPLE_CHOICE: {label: 'Несколько ответов', icon: <CircleCheck className="h-4 w-4"/>},
                        }[t];
                        return (
                            <Button
                                key={t}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="gap-2"
                                onClick={() => handleTypeChange(t)}
                            >
                                {config.icon}
                                {config.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* 🔹 CODING */}
            {type === 'CODING' && value?.type === 'CODING' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Код и тесты</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Шаблон кода (опционально)</Label>
                            <Textarea
                                placeholder="// Введите шаблон кода для пользователя"
                                value={value.templateCode || ''}
                                onChange={(e) => handleCodingChange('templateCode', e.target.value)}
                                className="font-mono text-sm"
                                rows={6}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Тест-кейсы</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                                    <Plus className="h-4 w-4 mr-1"/> Добавить тест
                                </Button>
                            </div>

                            {value.testCases.map((tc, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder="Input"
                                            value={tc.input}
                                            onChange={(e) => updateTestCase(i, 'input', e.target.value)}
                                            className="font-mono text-sm"
                                        />
                                        <Input
                                            placeholder="Expected Output"
                                            value={tc.output}
                                            onChange={(e) => updateTestCase(i, 'output', e.target.value)}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => removeTestCase(i)}
                                        disabled={value.testCases.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 🔹 SINGLE_CHOICE */}
            {type === 'SINGLE_CHOICE' && value?.type === 'SINGLE_CHOICE' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Вопрос с одним ответом</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Вопрос</Label>
                            <Input
                                placeholder="Введите текст вопроса"
                                value={value.question}
                                onChange={(e) => handleQuestionChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Варианты ответов</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                    <Plus className="h-4 w-4 mr-1"/> Добавить вариант
                                </Button>
                            </div>

                            {value.options.map((opt, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder={`Вариант ${i + 1}`}
                                            value={opt.text}
                                            onChange={(e) => updateOption(i, 'text', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Пояснение (опционально)"
                                            value={opt.explanation || ''}
                                            onChange={(e) => updateOption(i, 'explanation', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            type="button"
                                            variant={value.correctOptionIndex === i ? 'default' : 'outline'}
                                            size="icon"
                                            className={value.correctOptionIndex === i ? 'bg-green-600 hover:bg-green-700' : ''}
                                            onClick={() => handleSingleCorrectChange(i)}
                                            title="Правильный ответ"
                                        >
                                            <CircleDot className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeOption(i)}
                                            disabled={value.options.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 🔹 MULTIPLE_CHOICE */}
            {type === 'MULTIPLE_CHOICE' && value?.type === 'MULTIPLE_CHOICE' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Вопрос с несколькими ответами</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Вопрос</Label>
                            <Input
                                placeholder="Введите текст вопроса"
                                value={value.question}
                                onChange={(e) => handleQuestionChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Варианты ответов (выберите несколько правильных)</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                    <Plus className="h-4 w-4 mr-1"/> Добавить вариант
                                </Button>
                            </div>

                            {value.options.map((opt, i) => {
                                const isCorrect = value.correctOptionIndices.includes(i);
                                return (
                                    <div key={i} className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder={`Вариант ${i + 1}`}
                                                value={opt.text}
                                                onChange={(e) => updateOption(i, 'text', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Пояснение (опционально)"
                                                value={opt.explanation || ''}
                                                onChange={(e) => updateOption(i, 'explanation', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                type="button"
                                                variant={isCorrect ? 'default' : 'outline'}
                                                size="icon"
                                                className={isCorrect ? 'bg-green-600 hover:bg-green-700' : ''}
                                                onClick={() => handleMultipleCorrectToggle(i)}
                                                title={isCorrect ? 'Убрать из правильных' : 'Отметить как правильный'}
                                            >
                                                <CircleCheck className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => removeOption(i)}
                                                disabled={value.options.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}