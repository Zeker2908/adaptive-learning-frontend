import {RootLayout} from '@/components/layout/RootLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ArrowRight, MessageSquare, Trophy, Users} from 'lucide-react';
import {motion} from 'framer-motion';

export default function CommunityPage() {


    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {staggerChildren: 0.1},
        },
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 12},
        visible: {opacity: 1, y: 0, transition: {duration: 0.3}},
    };

    return (
        <RootLayout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto p-4 space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                        <Users className="h-6 w-6 text-primary"/>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Сообщество</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Общайся с другими участниками, делись решениями и расти вместе
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        {label: 'Участников', value: '2.4K', icon: Users},
                        {label: 'Решений', value: '18K+', icon: Trophy},
                        {label: 'Обсуждений', value: '340', icon: MessageSquare},
                        {label: 'Онлайн', value: '128', icon: Users},
                    ].map((stat, i) => (
                        <Card key={i} className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <stat.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground"/>
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* Features */}
                <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
                    {[
                        {
                            title: 'Топ участников',
                            description: 'Смотри лидеров по решениям и серии побед',
                            icon: Trophy,
                            action: 'Смотреть рейтинг',
                        },
                        {
                            title: 'Обсуждения',
                            description: 'Задавай вопросы и помогай другим разобраться',
                            icon: MessageSquare,
                            action: 'Открыть чат',
                        },
                        {
                            title: 'Делиться решениями',
                            description: 'Публикуй свои подходы и получай фидбек',
                            icon: Users,
                            action: 'Опубликовать',
                        },
                        {
                            title: 'События',
                            description: 'Участвуй в челленджах и марафонах',
                            icon: ArrowRight,
                            action: 'Ближайшие',
                        },
                    ].map((feature, i) => (
                        <Card key={i} className="group hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <feature.icon
                                        className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"/>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                                        {feature.action}
                                        <ArrowRight className="h-3 w-3 ml-1"/>
                                    </Button>
                                </div>
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div variants={itemVariants} className="text-center pt-4">
                    <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold">Ещё нет аккаунта?</h3>
                            <p className="text-sm text-muted-foreground">
                                Присоединяйся к сообществу и начни учиться вместе с другими
                            </p>
                            <div className="flex justify-center gap-3">
                                <Button variant="outline">Войти</Button>
                                <Button>Зарегистрироваться</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </RootLayout>
    );
}
