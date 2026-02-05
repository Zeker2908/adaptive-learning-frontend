// pages/Login.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome Back"
            description="Sign in to your account to continue"
        >
            <LoginForm />

            <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
}