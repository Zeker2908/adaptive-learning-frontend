// routes/index.tsx
import {createBrowserRouter} from 'react-router-dom';
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
import RootRedirect from "@/routes/RootRedirect.tsx";
import {ProfilePage} from "@/pages/Profile.tsx";
import {AdminRoute} from "@/routes/AdminRoute.tsx";
import AdminUsersPage from "@/pages/AdminUsersPage.tsx";
import UserViewPage from "@/pages/UserViewPage.tsx";
import AdminCreateTaskPage from "@/pages/AdminCreateTaskPage.tsx";
import AdminTasksPage from "@/pages/AdminTasksPage.tsx";

export const router = createBrowserRouter([
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

    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: '/dashboard',
                element: <DashboardPage/>
            },
            {
                path: '/profile',
                element: <ProfilePage/>
            },

            {
                element: <AdminRoute/>,
                children: [
                    {path: '/admin/users', element: <AdminUsersPage/>},
                    {path: '/admin/users/:userId', element: <UserViewPage/>},
                    {path: '/admin/tasks', element: <AdminTasksPage/>},
                    {path: '/admin/tasks/create', element: <AdminCreateTaskPage/>},
                ]
            }
        ]
    },

    {
        path: '/',
        element: <RootRedirect/>,
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