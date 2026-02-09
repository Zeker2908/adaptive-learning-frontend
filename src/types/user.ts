// types/user.ts

export interface UserUpdateRequest {
    firstName: string;
    lastName?: string;
}

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    localUser: boolean;
    oauthUser: boolean;
}