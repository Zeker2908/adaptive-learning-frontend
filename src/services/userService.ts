// services/userService.ts

import {api} from "./api";
import type {UserResponse, UserUpdateRequest} from "@/types/user";
import type {BindPasswordRequest, ChangePasswordRequest} from "@/types/auth.ts";

export const userService = {
    async currentUser(): Promise<UserResponse> {
        return api.get('/users/me');
    },

    async updateCurrentUser(data: UserUpdateRequest): Promise<UserResponse> {
        return api.put('/users/me', data);
    },

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        return api.patch('/users/me/password', data);
    },

    async bindPassword(data: BindPasswordRequest): Promise<UserResponse> {
        return api.post('/users/me/password/bind', data);
    }
}