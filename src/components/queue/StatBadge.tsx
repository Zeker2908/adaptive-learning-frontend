// components/queue/StatBadge.tsx
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils'; // 🔹 Если используете shadcn's cn utility

interface Props {
    icon: ReactNode;
    label: string;
    value: number;
    variant?: 'success' | 'error' | 'warning' | 'info';
    animatePresence?: boolean;
    compact?: boolean; // 🔹 Для мобильной версии
}

const variants = {
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/50',
    error: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800/50',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/50',
    info: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800/50',
};

export function StatBadge({
                              icon,
                              label,
                              value,
                              variant = 'info',
                              animatePresence = false,
                              compact = false
                          }: Props) {
    return (
        <motion.div
            layout
            initial={animatePresence ? { opacity: 0, scale: 0.8, y: -8 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.1
            }}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                variants[variant],
                compact && 'gap-1 px-2 py-0.5 text-[10px]',
                'hover:shadow-sm hover:shadow-current/5 cursor-default'
            )}
        >
            {/* Иконка — фиксированный размер для консистентности */}
            <span className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}>
                {icon}
            </span>

            {/* Лейбл — скрываем на очень маленьких экранах в компактном режиме */}
            {!compact && (
                <span className="text-muted-foreground/80 hidden xs:inline">
                    {label}
                </span>
            )}

            {/* Значение — всегда видно */}
            <motion.span
                key={value}
                initial={{ opacity: 0.5, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'tween', duration: 0.15 }}
                className={cn(
                    'font-semibold tabular-nums',
                    compact ? 'text-[11px]' : 'text-xs'
                )}
            >
                {value}
            </motion.span>
        </motion.div>
    );
}
