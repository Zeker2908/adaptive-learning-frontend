// services/recommendationService

import type {TaskResponse} from "@/types/task.ts";
import {api} from "@/services/api.ts";

export const recommendationService = {

    async getRecommendations(params?: { limit?: number }): Promise<TaskResponse[]> {
        const limit = params?.limit ?? 5;
        return api.get(`/recommendations?limit=${limit}`);
    },
}