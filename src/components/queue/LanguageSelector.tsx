// components/queue/LanguageSelector.tsx
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {LANGUAGES} from '@/types/languages.ts';

interface Props {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function LanguageSelector({value, onChange, disabled}: Props) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-40">
                <SelectValue placeholder="Язык"/>
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map(lang => (
                    <SelectItem key={lang.id} value={lang.id}>
                        {lang.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}