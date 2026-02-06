// types/auth.ts
export interface LoginRequest {
    email: string;
    password: string;
}

// Тип для формы регистрации (с подтверждением пароля)
export interface RegisterFormValues {
    email: string;
    firstName: string;
    lastName?: string;
    password: string;
    confirmPassword: string;
}

// Тип для API запроса (без подтверждения пароля)
export interface RegisterRequest {
    email: string;
    firstName: string;
    lastName?: string;
    password: string;
}

export interface ResetPasswordFormValues{
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordRequest{
    token: string;
    password: string;
}

export interface ResendRequest {
    email: string;
}

export interface ConfirmationEmailRequest {
    token: string;
}

export interface AuthenticationResponse {
    token: string;
}

export interface ApiError {
    timestamp: string;
    path: string;
    status: number;
    error: string;
    errorCode: string;
    message: string;
    requestId?: string;
}