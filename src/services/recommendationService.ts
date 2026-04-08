// services/recommendationService

import type {TaskResponse} from "@/types/task.ts";
import {api} from "@/services/api.ts";

export const recommendationService = {

    async getRecommendations(): Promise<TaskResponse[]> {
        return api.get(`/recommendations`);
    },
}