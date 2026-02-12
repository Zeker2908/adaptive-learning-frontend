// services/solutionService.ts

import type {DailyActivityResponse, UserProgressResponse} from "@/types/solution.ts";
import {api} from "@/services/api.ts";
import type {Page} from "@/types/page.ts";

export const solutionService = {
    // === обычный пользователь ===
    async getDailyActivities(days?: number): Promise<DailyActivityResponse[]> {
        const query = days ? `?days=${days}` : '';
        return api.get(`/solutions/user/activity${query}`);
    },

    async getUserProgress(
        page: number = 0,
        size: number = 20
    ): Promise<Page<UserProgressResponse>> {
        return api.get(
            `/solutions/user/progress?page=${page}&size=${size}`
        );
    },

    // === админский функционал ===
    async getUserProgressByAdmin(
        userId: string,
        page: number = 0,
        size: number = 20
    ): Promise<Page<UserProgressResponse>> {
        return api.get(
            `/admin/solutions/user/progress/${userId}?page=${page}&size=${size}`
        );
    },

    async getDailyActivitiesByAdmin(
        userId: string,
        days: number = 14
    ): Promise<DailyActivityResponse[]> {
        return api.get(
            `/admin/solutions/user/activity/${userId}?days=${days}`
        );
    },
};
