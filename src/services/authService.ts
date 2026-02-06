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
        return api.patch<AuthenticationResponse>('/auth/email/verify', data);
    },

    async resendConfirmationEmail(data: ResendRequest): Promise<void> {
        return api.post('/auth/email/resend-verification', data);
    },

    async forgotPassword(data: ResendRequest): Promise<void> {
        return api.post('/auth/password/reset-request', data);
    },

    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        return api.patch('/auth/password', data);
    },

    async logout(): Promise<void> {
        return api.delete<void>('/auth/sessions/current');
    },

    async logoutAll(): Promise<void> {
        return api.delete<void>('/auth/sessions');
    },
};