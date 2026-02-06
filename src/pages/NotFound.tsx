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
                        Страница не найдена
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-gray-600 mb-6">
                        Извините, страница, которую вы ищете, не существует.
                    </p>
                    <Button asChild>
                        <Link to="/dashboard">Перейти в личный кабинет</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
