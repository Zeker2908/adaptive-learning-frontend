// components/dashboard/DashboardHeader.tsx
interface Props {
    firstName?: string;
}

export function DashboardHeader({firstName}: Props) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
                Добро пожаловать, {firstName ?? 'пользователь'}!
            </h1>
            <p className="text-gray-600">
                Управляйте аккаунтом и отслеживайте прогресс
            </p>
        </div>
    );
}
