export interface UserResponse{
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    role: string;
    isLocalAuthUser: boolean;
    isOAuthUser: boolean;
}