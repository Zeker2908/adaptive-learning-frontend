// pages/Dashboard.tsx
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {userService} from "@/services/userService.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {useError} from "@/hooks/useError.ts";

export default function DashboardPage() {
    const navigate = useNavigate();
    const {token, isAuthenticated, logout} = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<{ email?: string } | null>(null);
    const {handleError} = useError();

    // Проверка токена и получение данных пользователя (опционально)
    useEffect(() => {
        const validateToken = async () => {
            if (!isAuthenticated || !token) {
                navigate('/login', {replace: true});
                return;
            }

            try {
                const user = await userService.currentUser();
                setUserData({email: user.email});
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [isAuthenticated, token, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            handleError(error);
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome to your account</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Info Card */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Your Account</CardTitle>
                            <CardDescription>Account information and settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userData?.email && (
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{userData.email}</p>
                                </div>
                            )}
                            <Button variant="outline" onClick={() => navigate('/profile')}>
                                View Profile
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common actions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => navigate('/settings')}
                            >
                                Settings
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Stats Cards (placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity</CardTitle>
                            <CardDescription>Your recent activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500 py-8">
                                No recent activity
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                            <CardDescription>Your learning progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500 py-8">
                                Track your progress here
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}