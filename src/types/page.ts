// types/page.ts
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
    size: number;
    number: number; // текущая страница (0-based)
    numberOfElements: number;
    empty: boolean;
}
