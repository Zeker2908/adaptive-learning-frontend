// services/adminService.ts

import type {AdminUserResponse} from "@/types/user.ts";
import type {Page} from "@/types/page.ts";
import {api} from "@/services/api.ts";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUUID = (value: string): boolean => UUID_REGEX.test(value.trim());

export const adminService = {

    async getUsers(
        page: number,
        size: number = 20,
        sortField?: string,
        sortDirection: 'asc' | 'desc' = 'asc'
    ): Promise<Page<AdminUserResponse>> {
        let url = `/admin/users?page=${page}&size=${size}`;
        if (sortField) {
            url += `&sort=${sortField},${sortDirection}`;
        }
        return api.get(url);
    },

    async searchUsersByEmail(prefix: string, limit: number = 10): Promise<AdminUserResponse[]> {
        if (!prefix.trim()) {
            return [];
        }
        return api.get(
            `/admin/users/search?q=${encodeURIComponent(prefix)}&limit=${limit}`
        );
    },

    async getUserById(userId: string): Promise<AdminUserResponse> {
        return api.get(`/admin/users/${userId}`);
    },

    /**
     * Умный поиск:
     * - если UUID → ищем по ID
     * - иначе → ищем по email prefix
     */
    async smartSearch(query: string): Promise<AdminUserResponse[]> {
        const trimmed = query.trim();

        if (!trimmed) return [];

        if (isUUID(trimmed)) {
            const user = await this.getUserById(trimmed);
            return user ? [user] : [];
        }

        return this.searchUsersByEmail(trimmed);
    },

    async grantAdmin(userId: string): Promise<AdminUserResponse> {
        return api.patch(`/admin/users/${userId}/grant-admin`);
    },

    async blockUser(userId: string): Promise<AdminUserResponse> {
        return api.patch(`/admin/users/${userId}/block`);
    },

    async unblockUser(userId: string): Promise<AdminUserResponse> {
        return api.patch(`/admin/users/${userId}/unblock`);
    },
}
