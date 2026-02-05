// services/api.ts

import type {ApiError} from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData: ApiError = await response.json();
                throw errorData;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error');
        }
    },

    get<T>(endpoint: string, options?: RequestInit) {
        return this.request<T>(endpoint, {...options, method: 'GET'});
    },

    post<T, D = unknown>(endpoint: string, data?: D, options?: RequestInit) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put<T, D = unknown>(endpoint: string, data?: D, options?: RequestInit) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    patch<T, D = unknown>(endpoint: string, data?: D, options?: RequestInit) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    delete<T>(endpoint: string, options?: RequestInit) {
        return this.request<T>(endpoint, {...options, method: 'DELETE'});
    },
};