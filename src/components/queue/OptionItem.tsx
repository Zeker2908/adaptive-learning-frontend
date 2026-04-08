// components/queue/OptionItem.tsx
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Props {
    index: number;
    text: string;
    isSelected: boolean;
    isMultiple: boolean;
    disabled?: boolean;
    onSelect: (index: number) => void;
}

export function OptionItem({
                               index,
                               text,
                               isSelected,
                               isMultiple,
                               disabled,
                               onSelect
                           }: Props) {
    return (
        <label
            className={cn(
                'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors',
                isSelected
                    ? 'bg-primary/5 border-primary/50'
                    : 'hover:bg-muted/50',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={(e) => {
                e.preventDefault();
                if (!disabled) onSelect(index);
            }}
        >
            {isMultiple ? (
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !disabled && onSelect(index)}
                    disabled={disabled}
                    className="mt-0.5"
                />
            ) : (
                <div
                    className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5',
                        isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/50'
                    )}
                >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-background" />}
                </div>
            )}

            <span className="text-sm leading-relaxed">{text}</span>

            {/* Индекс варианта (A, B, C...) */}
            <span className="ml-auto text-xs font-mono text-muted-foreground">
        {String.fromCharCode(65 + index)}
      </span>
        </label>
    );
}
