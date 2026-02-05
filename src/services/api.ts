// services/api.ts
import {useAuthStore} from '@/store/authStore';
import type {ApiError, AuthenticationResponse} from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Флаг для предотвращения множественных refresh запросов
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

        // Добавляем токен если есть
        const {token} = useAuthStore.getState();
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData: ApiError = await response.json().catch(() => ({
                    timestamp: new Date().toISOString(),
                    path: endpoint,
                    status: response.status.toString(),
                    error: response.statusText,
                    message: 'An error occurred',
                    requestId: 'unknown',
                }));

                // Обработка TOKEN_EXPIRED
                if (errorData.reason === 'TOKEN_EXPIRED') {
                    if (isRefreshing) {
                        // Ждём завершения текущего refresh
                        return new Promise((resolve, reject) => {
                            failedQueue.push({resolve, reject});
                        }).then(() => {
                            // Повторяем оригинальный запрос с новым токеном
                            return this.request<T>(endpoint, options);
                        });
                    }

                    isRefreshing = true;

                    try {
                        // Пытаемся обновить токен
                        const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
                            method: 'POST',
                            credentials: 'include', // Важно для cookies
                        });

                        if (refreshResponse.ok) {
                            const tokenData: AuthenticationResponse = await refreshResponse.json();
                            const newToken = tokenData.token;

                            // Обновляем токен в store
                            useAuthStore.getState().setToken(newToken);

                            // Повторяем оригинальный запрос
                            processQueue(null, newToken);
                            return this.request<T>(endpoint, options);
                        } else {
                            // Refresh не удался - logout
                            useAuthStore.getState().clearToken();
                            processQueue(new Error('Refresh failed'));
                            throw errorData;
                        }
                    } catch (refreshError) {
                        useAuthStore.getState().clearToken();
                        processQueue(refreshError);
                        throw errorData;
                    } finally {
                        isRefreshing = false;
                    }
                }

                throw errorData;
            }

            // Обработка пустых ответов
            const contentLength = response.headers.get('content-length');
            if (response.status === 204 || contentLength === '0' || !response.headers.get('content-type')?.includes('application/json')) {
                return undefined as unknown as T;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error && error.name === 'SyntaxError') {
                throw new Error('Invalid response format');
            }
            throw error;
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