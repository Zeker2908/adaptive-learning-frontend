// routes/index.tsx
import {createBrowserRouter, Navigate} from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import DashboardPage from '@/pages/Dashboard';
import EmailConfirmationPage from '@/pages/EmailConfirmation';
import NotFoundPage from '@/pages/NotFound';
import OAuthCallbackPage from '@/pages/OAuthCallback';
import ResendVerificationPage from '@/pages/ResendVerification';
import ResetPasswordPage from '@/pages/ResetPassword';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import {ProtectedRoute} from './ProtectedRoute';
import {PublicRoute} from './PublicRoute';

export const router = createBrowserRouter([
    // Публичные маршруты (только для неавторизованных)
    {
        element: <PublicRoute/>,
        children: [
            {
                path: '/login',
                element: <LoginPage/>,
            },
            {
                path: '/register',
                element: <RegisterPage/>,
            },
            {
                path: '/forgot-password',
                element: <ForgotPasswordPage/>,
            },
            {
                path: '/resend-verification',
                element: <ResendVerificationPage/>,
            },
        ],
    },

    // Приватные маршруты (только для авторизованных)
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        ),
    },

    {
        path: '/',
        loader: () => {
            // Редирект с корня в зависимости от авторизации
            const token = localStorage.getItem('auth-storage');
            if (token) {
                return {redirect: '/dashboard'};
            }
            return {redirect: '/login'};
        },
        // Но проще использовать компонент:
        element: <Navigate to="/dashboard" replace/>,
    },
    {
        path: '/email-confirmation',
        element: <EmailConfirmationPage/>,
    },
    {
        path: '/password-reset',
        element: <ResetPasswordPage/>,
    },
    {
        path: '/oauth/callback',
        element: <OAuthCallbackPage/>,
    },

    // 404
    {
        path: '*',
        element: <NotFoundPage/>,
    },
]);