import type {Language as BackendLanguage} from '@/types/solution.ts';

export interface LangConfig {
    id: string;                    // для UI и localStorage
    label: string;                 // человекочитаемое название
    backend: BackendLanguage;      // значение для отправки на бэк
    monaco: string;                // идентификатор для Monaco Editor
    defaultTemplate: string;       // шаблон кода при переключении
}

export const LANGUAGES: LangConfig[] = [
    {
        id: 'python',
        label: 'Python',
        backend: 'PYTHON_3_8_1',
        monaco: 'python',
        defaultTemplate: '# Введите ваше решение здесь\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
    },
    {
        id: 'javascript',
        label: 'JavaScript',
        backend: 'JAVASCRIPT_NODEJS_12_14_0',
        monaco: 'javascript',
        defaultTemplate: '// Введите ваше решение здесь\nfunction solve() {\n    // ваш код\n}\n\nsolve();\n',
    },
    {
        id: 'typescript',
        label: 'TypeScript',
        backend: 'TYPESCRIPT_3_7_4',
        monaco: 'typescript',
        defaultTemplate: '// Введите ваше решение здесь\nfunction solve(): void {\n    // ваш код\n}\n\nsolve();\n',
    },
    {
        id: 'java',
        label: 'Java',
        backend: 'JAVA_OPENJDK_13_0_1',
        monaco: 'java',
        defaultTemplate: 'public class Solution {\n    public static void main(String[] args) {\n        // Введите ваше решение здесь\n    }\n}\n',
    },
    {
        id: 'cpp',
        label: 'C++',
        backend: 'CPP_GCC_9_2_0',
        monaco: 'cpp',
        defaultTemplate: '#include <iostream>\n\nint main() {\n    // Введите ваше решение здесь\n    return 0;\n}\n',
    },
    {
        id: 'c',
        label: 'C',
        backend: 'C_GCC_9_2_0',
        monaco: 'c',
        defaultTemplate: '#include <stdio.h>\n\nint main() {\n    // Введите ваше решение здесь\n    return 0;\n}\n',
    },
    {
        id: 'go',
        label: 'Go',
        backend: 'GO_1_13_5',
        monaco: 'go',
        defaultTemplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Введите ваше решение здесь\n}\n',
    },
    {
        id: 'rust',
        label: 'Rust',
        backend: 'RUST_1_40_0',
        monaco: 'rust',
        defaultTemplate: 'fn main() {\n    // Введите ваше решение здесь\n}\n',
    },
    {
        id: 'kotlin',
        label: 'Kotlin',
        backend: 'KOTLIN_1_3_70',
        monaco: 'kotlin',
        defaultTemplate: 'fun main() {\n    // Введите ваше решение здесь\n}\n',
    },
    {
        id: 'csharp',
        label: 'C#',
        backend: 'C_SHARP_MONO_6_6_0_161',
        monaco: 'csharp',
        defaultTemplate: 'using System;\n\nclass Solution {\n    static void Main() {\n        // Введите ваше решение здесь\n    }\n}\n',
    },
];

export const getLangById = (id: string): LangConfig =>
    LANGUAGES.find(l => l.id === id) || LANGUAGES[0];

export const getLangByBackend = (backend: BackendLanguage): LangConfig =>
    LANGUAGES.find(l => l.backend === backend) || LANGUAGES[0];