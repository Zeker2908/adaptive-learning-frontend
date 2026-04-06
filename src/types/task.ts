// types/task.ts

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export const TASK_TYPES = [
    'CODING',
    'MULTIPLE_CHOICE',
    'SINGLE_CHOICE'
] as const;

export type TaskType = typeof TASK_TYPES[number];

export const isTaskType = (value: string): value is TaskType => {
    return TASK_TYPES.includes(value as TaskType);
};

export interface TestCase {
    input: string;
    output: string;
}

export interface CodingTaskContent {
    type: 'CODING';
    templateCode?: string;
    testCases: TestCase[];
}

export interface ChoiceOption {
    text: string;
    explanation?: string;
}

export interface MultipleChoiceTaskContent {
    type: 'MULTIPLE_CHOICE';
    question: string;
    options: ChoiceOption[];
    correctOptionIndices: number[];
}

export interface SingleChoiceTaskContent {
    type: 'SINGLE_CHOICE';
    question: string;
    options: ChoiceOption[];
    correctOptionIndex: number;
}

export type TaskContent =
    | CodingTaskContent
    | MultipleChoiceTaskContent
    | SingleChoiceTaskContent;

export interface TaskRequest {
    title: string;
    description?: string;
    difficulty: Difficulty;
    tags: string[];
    content: TaskContent;
}

export interface TaskResponse {
    id: string;
    title: string;
    description?: string;
    difficulty: Difficulty;
    tags: string[];
    content: TaskContent;
}