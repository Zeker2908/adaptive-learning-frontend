// routes/index.tsx
import {createBrowserRouter, Navigate} from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import DashboardPage from '@/pages/Dashboard';
import EmailConfirmationPage from '@/pages/EmailConfirmation';
import {ProtectedRoute} from './ProtectedRoute';
import NotFoundPage from "@/pages/NotFound.tsx";
import OAuthCallbackPage from "@/pages/OAuthCallback.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace/>,
    },
    {
        path: '/login',
        element: <LoginPage/>,
    },
    {
        path: '/register',
        element: <RegisterPage/>,
    },
    {
        path: '/email-confirmation',
        element: <EmailConfirmationPage/>,
    },
    {
        path: '/oauth/callback',
        element: <OAuthCallbackPage/>,
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: <NotFoundPage/>,
    }
]);