// components/dashboard/ActivityChartCard.tsx

import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import type { DailyActivityResponse } from "@/types/solution"

interface Props {
    data: DailyActivityResponse[]
}

const chartConfig = {
    count: {
        label: "Активность",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ActivityChartCard({ data }: Props) {
    return (
        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Активность</CardTitle>
                <CardDescription>
                    Ваша недавняя активность
                </CardDescription>
            </CardHeader>

            <CardContent>
                {data.length > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="min-h-55 w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={data}
                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeOpacity={0.2} />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={30}
                            />

                            <ChartTooltip content={<ChartTooltipContent />} />

                            <Bar
                                dataKey="count"
                                fill="var(--color-count)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        Нет недавней активности
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
