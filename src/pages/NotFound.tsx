// pages/NotFound.tsx
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Link} from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold text-gray-900">404</CardTitle>
                    <CardDescription className="text-lg">
                        Page not found
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-gray-600 mb-6">
                        Sorry, the page you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                        <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}