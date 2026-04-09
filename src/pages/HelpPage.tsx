import {RootLayout} from '@/components/layout/RootLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {BookOpen, ChevronRight, ExternalLink, HelpCircle, Mail, MessageCircle, Search,} from 'lucide-react';
import {motion} from 'framer-motion';
import {useState} from 'react';

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const faqItems = [
        {
            q: 'Как работает бесконечная очередь задач?',
            a: 'Система подбирает задачи на основе вашего прогресса. После решения или исчерпания попыток автоматически загружаются новые.',
        },
        {
            q: 'Можно ли менять язык программирования?',
            a: 'Да, в редакторе кода есть переключатель языков. Код сохраняется отдельно для каждого языка.',
        },
        {
            q: 'Что делать, если проверка зависла?',
            a: 'Обычно проверка занимает до 30 секунд. Если дольше — обновите страницу или попробуйте позже.',
        },
        {
            q: 'Как сбросить прогресс?',
            a: 'Настройки профиля → «Сбросить очередь». Внимание: это действие необратимо.',
        },
    ];

    const filteredFaq = searchQuery
        ? faqItems.filter(
            (item) =>
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqItems;

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {staggerChildren: 0.08},
        },
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 10},
        visible: {opacity: 1, y: 0, transition: {duration: 0.25}},
    };

    return (
        <RootLayout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-4xl mx-auto p-4 space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                        <HelpCircle className="h-6 w-6 text-primary"/>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Помощь</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Ответы на частые вопросы и способы связаться с поддержкой
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div variants={itemVariants}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Поиск по вопросам..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-3">
                    {[
                        {icon: BookOpen, label: 'Документация', href: '#'},
                        {icon: MessageCircle, label: 'Чат поддержки', href: '#'},
                        {icon: Mail, label: 'Написать нам', href: '#'},
                    ].map((link, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            className="justify-start gap-2 h-auto py-3"
                            asChild
                        >
                            <a href={link.href}>
                                <link.icon className="h-4 w-4"/>
                                {link.label}
                                <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground"/>
                            </a>
                        </Button>
                    ))}
                </motion.div>

                {/* FAQ */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground"/>
                        Частые вопросы
                    </h2>

                    {filteredFaq.length === 0 ? (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground">
                                Ничего не найдено по запросу «{searchQuery}»
                            </CardContent>
                        </Card>
                    ) : (
                        filteredFaq.map((item, i) => (
                            <Card key={i} className="hover:border-primary/30 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{item.q}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {item.a}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </motion.div>

                {/* Contact */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Не нашли ответ?</CardTitle>
                            <CardDescription>
                                Наша команда готова помочь с любым вопросом
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href="mailto:support@example.com"
                                        className="flex items-center gap-2"
                                    >
                                        <Mail className="h-4 w-4"/>
                                        support@example.com
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="#" className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4"/>
                                        Чат в приложении
                                    </a>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                💡 Совет: перед обращением опишите проблему максимально подробно —
                                так мы сможем помочь быстрее.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer note */}
                <motion.div variants={itemVariants} className="text-center pt-4 pb-8">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        Документация обновляется регулярно
                        <ExternalLink className="h-3 w-3"/>
                    </p>
                </motion.div>
            </motion.div>
        </RootLayout>
    );
}
