// components/dashboard/ActivityChartCard.tsx
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import type {DailyActivityResponse} from '@/types/solution';

interface Props {
    data: DailyActivityResponse[];
}

export function ActivityChartCard({data}: Props) {
    return (
        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Активность</CardTitle>
                <CardDescription>Ваша недавняя активность</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="date"/>
                            <YAxis/>
                            <Tooltip/>
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        Нет недавней активности
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
