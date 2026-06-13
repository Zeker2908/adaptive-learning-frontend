// services/oauthService.ts
export const oauthService = {
    googleLogin(): void {
        window.location.href = '/oauth2/authorization/google';
    },
};
