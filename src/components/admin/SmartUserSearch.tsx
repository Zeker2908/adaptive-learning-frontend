// components/admin/SmartUserSearch.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import {IdCard, Loader2, Mail, Search, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {adminService} from '@/services/adminService';
import type {AdminUserResponse} from '@/types/user.ts';
import {useError} from '@/hooks/useError.ts';

interface SmartUserSearchProps {
    onUserSelect: (user: AdminUserResponse | null) => void;
    value?: AdminUserResponse | null;
    placeholder?: string;
    disabled?: boolean;
}

export function SmartUserSearch({
                                    onUserSelect,
                                    value,
                                    placeholder = 'Введите email или ID...',
                                    disabled = false,
                                }: SmartUserSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<AdminUserResponse[]>([]);
    const [exactMatch, setExactMatch] = useState<AdminUserResponse | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {handleError} = useError();

    const isValidUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    useEffect(() => {
        if (value) setQuery(value.email);
        else if (!open) setQuery('');
    }, [value, open]);

    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            setExactMatch(null);
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const trimmedQuery = query.trim();

                if (isValidUuid(trimmedQuery)) {
                    try {
                        const user = await adminService.getUserById(trimmedQuery);
                        setExactMatch(user);
                        setSearchResults([]);
                    } catch {
                        setExactMatch(null);
                        setSearchResults([]);
                    }
                } else if (trimmedQuery.includes('@')) {
                    try {
                        const user = await adminService.getUserByEmail(trimmedQuery);
                        setExactMatch(user);
                        setSearchResults([]);
                    } catch {
                        setExactMatch(null);
                        setSearchResults([]);
                    }
                } else {
                    setExactMatch(null);
                    const results = await adminService.searchUsersByEmail(trimmedQuery, 10);
                    setSearchResults(results);
                }
            } catch (error) {
                handleError(error);
                setSearchResults([]);
                setExactMatch(null);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [query, handleError]);

    const handleSelect = (user: AdminUserResponse) => {
        onUserSelect(user);
        setQuery(user.email);
        setOpen(false);
    };

    const handleClear = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setQuery('');
        setSearchResults([]);
        setExactMatch(null);
        onUserSelect(null);
        setOpen(false);
    };

    const displayValue = value ? `${value.email} (${value.firstName} ${value.lastName})` : '';

    return (
        <Popover open={open} onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between text-left', !value && 'text-muted-foreground')}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {value ? (
                            <>
                                <Mail className="h-4 w-4 shrink-0"/>
                                <span className="truncate">{displayValue}</span>
                            </>
                        ) : (
                            <span className="truncate">{placeholder}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {value && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-transparent hover:text-foreground"
                                onClick={handleClear}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        )}
                        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50"/>
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full max-w-md p-2 max-h-100 overflow-hidden">
                <Command className="overflow-hidden">
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50"/>
                        <CommandInput
                            placeholder={placeholder}
                            value={query}
                            onValueChange={setQuery}
                            disabled={disabled}
                        />
                    </div>

                    <CommandList className="max-h-75 overflow-y-auto">
                        {isLoading && (
                            <div className="py-6 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary"/>
                                <p className="text-xs text-muted-foreground mt-2">Поиск...</p>
                            </div>
                        )}

                        {!isLoading && exactMatch && (
                            <CommandGroup heading="Точное совпадение">
                                <CommandItem onSelect={() => handleSelect(exactMatch)}
                                             className="flex items-center gap-3 p-2">
                                    {exactMatch.id === query.trim() ? (
                                        <IdCard className="h-4 w-4 text-blue-500"/>
                                    ) : (
                                        <Mail className="h-4 w-4 text-green-500"/>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{exactMatch.email}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {exactMatch.firstName} {exactMatch.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <IdCard className="h-3 w-3"/>
                                            <span className="truncate">{exactMatch.id}</span>
                                        </div>
                                    </div>
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {!isLoading && searchResults.length > 0 && (
                            <CommandGroup heading="Результаты поиска">
                                {searchResults.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        onSelect={() => handleSelect(user)}
                                        className="flex items-center gap-3 p-2 hover:bg-accent"
                                    >
                                        <Mail className="h-4 w-4 text-muted-foreground"/>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{user.email}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {!isLoading && !exactMatch && searchResults.length === 0 && query && (
                            <CommandEmpty className="py-6 text-center">
                                <div className="text-muted-foreground">
                                    <p className="mb-2">Ничего не найдено</p>
                                    <p className="text-xs">Попробуйте ввести полный email или корректный ID
                                        пользователя</p>
                                </div>
                            </CommandEmpty>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function ChevronsUpDownIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m7 15 5 5 5-5"/>
            <path d="m7 9 5-5 5 5"/>
        </svg>
    );
}
