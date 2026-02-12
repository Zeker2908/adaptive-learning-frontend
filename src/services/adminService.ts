// services/adminService.ts

import type {AdminUserResponse} from "@/types/user.ts";
import type {Page} from "@/types/page.ts";
import {api} from "@/services/api.ts";

export const adminService = {

    async getUsers(
        page: number,
        size: number = 20
    ): Promise<Page<AdminUserResponse>> {
        return api.get(`/admin/users?page=${page}&size=${size}`);
    },

    async searchUsersByEmail(prefix: string, limit: number = 10): Promise<AdminUserResponse[]> {
        if (!prefix.trim()) {
            return [];
        }
        return api.get(
            `/admin/users/search?q=${encodeURIComponent(prefix)}&limit=${limit}`
        );
    },

    /**
     * Получить пользователя по ID
     */
    async getUserById(userId: string): Promise<AdminUserResponse> {
        return api.get(`/admin/users/${userId}`);
    },

    /**
     * Получить пользователя по полному email
     */
    async getUserByEmail(email: string): Promise<AdminUserResponse> {
        return api.get(`/admin/users/email/${encodeURIComponent(email)}`);
    },

    /**
     * Выдать права администратора пользователю
     */
    async grantAdmin(userId: string): Promise<AdminUserResponse> {
        return api.patch(`/admin/users/${userId}/grant-admin`);
    },

    /**
     * Заблокировать пользователя
     */
    async blockUser(userId: string): Promise<AdminUserResponse> {
        return api.patch(`/admin/users/${userId}/block`);
    },

    /**
     * Разблокировать пользователя
     */
    async unblockUser(userId: string): Promise<AdminUserResponse> {
        return api.patch(`/admin/users/${userId}/unblock`);
    },

}