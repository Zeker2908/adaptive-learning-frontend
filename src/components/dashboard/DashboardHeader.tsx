// components/dashboard/DashboardHeader.tsx

interface Props {
    firstName?: string;
}

export function DashboardHeader({firstName}: Props) {
    const subTitles = [
        "Каждый день — шаг к новым знаниям",
        "Учитесь, растите, достигайте целей",
        "Сегодня — лучшее время для обучения",
        "Развивайте навыки и расширяйте горизонты",
        "Маленький прогресс каждый день ведёт к большим результатам",
        "Учение делает сильнее и увереннее",
        "Каждое занятие приближает к успеху",
        "Новые знания открывают новые возможности",
        "Совершенствуйте себя шаг за шагом",
        "Учитесь с удовольствием и вдохновением"
    ];

    // Генерируем индекс на основе текущей даты
    const today = new Date();
    const dayString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`; // YYYY-M-D
    const hash = Array.from(dayString).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % subTitles.length;
    const dailySubTitle = subTitles[index];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
                Добро пожаловать, {firstName ?? 'пользователь'}!
            </h1>
            <p className="text-gray-600">
                {dailySubTitle}
            </p>
        </div>
    );
}
