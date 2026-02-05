// services/oauthService.ts
const OAUTH_BASE_URL = import.meta.env.VITE_OAUTH_BASE_URL || 'http://localhost:8080';

export const oauthService = {
    googleLogin(): void {
        window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/google`;
    }
};