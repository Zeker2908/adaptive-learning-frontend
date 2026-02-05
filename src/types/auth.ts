// types/auth.ts
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
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
    status: string;
    error: string;
    message: string;
    requestId: string;
    reason?: string; // TOKEN_EXPIRED
}