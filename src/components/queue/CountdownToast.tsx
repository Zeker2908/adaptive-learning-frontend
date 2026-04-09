// components/queue/CountdownToast.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    countdown: number;
    totalSeconds?: number;
}

export function CountdownToast({ countdown, totalSeconds = 3 }: Props) {
    const progress = (countdown / totalSeconds) * 100;

    return (
        <AnimatePresence>
            {countdown > 0 && (
                <motion.div
                    // 🔹 Тихое появление: просто плавный фейд
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="inline-flex flex-col items-center gap-1"
                >
                    {/* Текст: минималистичный, без иконок */}
                    <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
                        <span>через</span>
                        <motion.span
                            key={countdown}
                            // 🔹 Цифра просто плавно появляется, без скачков
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            className="font-mono font-semibold text-foreground"
                        >
                            {countdown}
                        </motion.span>
                        <span>с</span>
                    </div>

                    {/* 🔹 Тонкий прогресс-бар: едва заметный, но информативный */}
                    <div className="w-16 h-px bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-foreground/30"
                            initial={{ width: '100%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
