// pages/Register.tsx
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Create Account"
            description="Join us and start your journey"
        >
            <RegisterForm />

            <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    );
}