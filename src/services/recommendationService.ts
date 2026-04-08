// services/recommendationService

import type {TaskResponse} from "@/types/task.ts";
import {api} from "@/services/api.ts";

export const recommendationService = {

    async getRecommendations(limit: number): Promise<TaskResponse[]> {
        return api.get(`/recommendations?limit=${limit}`);
    },
}