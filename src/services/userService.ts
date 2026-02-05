import {api} from "./api";
import type {UserResponse} from "@/types/user";

export const userService = {
    async currentUser(): Promise<UserResponse> {
        return api.get<UserResponse>('/users/me');
    }
}