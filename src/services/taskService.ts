// services/taskServices.ts

import type {TaskRequest, TaskResponse} from "@/types/task.ts";
import {api} from "@/services/api.ts";
import type {Page} from "@/types/page.ts";

export const taskService = {

    async getTaskById(id: string): Promise<TaskResponse> {
        return api.get(`/tasks/${id}`);
    },

    // === админский функционал ===
    async createTask(data: TaskRequest): Promise<TaskResponse> {
        return api.post("/admin/tasks", data);
    },

    async updateTask(id: string, data: TaskRequest): Promise<TaskResponse> {
        return api.put(`/admin/tasks/${id}`, data);
    },

    async deleteTask(id: string): Promise<void> {
        return api.delete(`/admin/tasks/${id}`);
    },

    async getTasks(params: {
        page?: number;
        size?: number;
        title?: string;
        difficulties?: string[];
        tags?: string[];
        sortField?: string;
        sortDirection?: 'asc' | 'desc';
    }): Promise<Page<TaskResponse>> {

        const {
            page = 0,
            size = 20,
            title,
            difficulties,
            tags,
            sortField,
            sortDirection = 'asc'
        } = params;

        const query = new URLSearchParams();

        query.append('page', String(page));
        query.append('size', String(size));

        if (title) {
            query.append('title', title);
        }

        if (difficulties && difficulties.length > 0) {
            difficulties.forEach(d => query.append('difficulty', d));
        }

        if (tags && tags.length > 0) {
            tags.forEach(tag => query.append('tags', tag));
        }

        if (sortField) {
            query.append('sort', `${sortField},${sortDirection}`);
        }

        return api.get(`/admin/tasks?${query.toString()}`);
    },
}