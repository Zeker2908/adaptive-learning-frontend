// services/authService.ts
import {api} from '@/services/api';
import type {
    AuthenticationResponse,
    ConfirmationEmailRequest,
    LoginRequest,
    RegisterRequest,
    ResendRequest,
    ResetPasswordRequest
} from '@/types/auth';

export const authService = {
    async login(data: LoginRequest): Promise<AuthenticationResponse> {
        return api.post<AuthenticationResponse>('/auth/login', data);
    },

    async register(data: RegisterRequest): Promise<void> {
        return api.post<void>('/auth/register', data);
    },

    async confirmEmail(data: ConfirmationEmailRequest): Promise<AuthenticationResponse> {
        return api.post<AuthenticationResponse>('/auth/verify-email', data);
    },

    async resendConfirmationEmail(data: ResendRequest): Promise<void> {
        return api.post('/auth/resend-verification', data);
    },

    async forgotPassword(data: ResendRequest): Promise<void> {
        return api.post('/auth/password/forgot', data);
    },

    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        return api.patch('/auth/password/reset', data);
    },

    async logout(): Promise<void> {
        return api.delete<void>('/auth/logout');
    },

    async logoutAll(): Promise<void> {
        return api.delete<void>('/auth/logout/all');
    },
};