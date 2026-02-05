// services/authService.ts
import {api} from '@/services/api';
import type {AuthenticationResponse, ConfirmationEmailRequest, LoginRequest, RegisterRequest} from '@/types/auth';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
        return api.post<AuthenticationResponse, LoginRequest>('/auth/login', credentials);
    },

    async register(data: RegisterRequest): Promise<void> {
        return api.post<void, RegisterRequest>('/auth/register', data);
    },

    async confirmEmail(data: ConfirmationEmailRequest): Promise<AuthenticationResponse> {
        return api.patch<AuthenticationResponse, ConfirmationEmailRequest>('/auth/email/verify', data);
    },

    async logout(): Promise<void> {
        return api.delete<void>('/auth/sessions/current');
    },

    async logoutAll(): Promise<void> {
        return api.delete<void>('/auth/sessions');
    },
};