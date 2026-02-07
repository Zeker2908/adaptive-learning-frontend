// services/solutionService.ts

import type {DailyActivityResponse, UserProgressResponse} from "@/types/solution.ts";
import {api} from "@/services/api.ts";
import type {Page} from "@/types/page.ts";

export const solutionService = {
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

}


