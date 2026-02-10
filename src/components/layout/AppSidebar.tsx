// components/layout/AppSidebar.tsx
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {BookOpen, ChevronDown, ChevronUp, HelpCircle, Home, LogOut, Play, Settings, Trophy, Users,} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useAuthStore} from "@/store/authStore.ts";
import {useToast} from "@/hooks/useToast.ts";
import {useUserStore} from '@/store/userStore';
import logo from '@/assets/logo.svg';
import {useState} from 'react';

const items = [
    {title: "Главная", url: "/dashboard", icon: Home},
    {title: "Бесконечная очередь", url: "/task-stream", icon: Play},
    {title: "Курсы", url: "/courses", icon: BookOpen},
    {title: "Прогресс", url: "/progress", icon: Trophy},
    {title: "Сообщество", url: "/community", icon: Users},
    {title: "Помощь", url: "/help", icon: HelpCircle},
];

export function AppSidebar() {
    const navigate = useNavigate();
    const {user} = useUserStore();
    const {logout, logoutAll} = useAuthStore();
    const {showSuccessToast} = useToast();
    const [isLogoutExpanded, setIsLogoutExpanded] = useState(false);

    const handleLogout = () => {
        logout();
        setIsLogoutExpanded(false);
    };

    const handleLogoutAll = () => {
        logoutAll();
        setIsLogoutExpanded(false);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-lg font-bold"
                            onClick={() => navigate('/dashboard')}
                        >
                            <img
                                src={logo}
                                alt="Adaptive Learning"
                                className="h-6 w-6"
                            />
                            <span className="font-semibold">Adaptive Learning</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={window.location.pathname === item.url}
                                >
                                    <button
                                        onClick={() => navigate(item.url)}
                                        className="w-full flex items-center gap-3"
                                    >
                                        <item.icon className="h-5 w-5"/>
                                        <span>{item.title}</span>
                                    </button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {/* Кнопка "Настройки" */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            onClick={() => navigate('/settings')}
                        >
                            <button className="w-full flex items-center gap-3">
                                <Settings className="h-5 w-5"/>
                                <span>Настройки</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Развертываемый блок выхода */}
                    <SidebarMenuItem>
                        <div className="space-y-1">
                            <SidebarMenuButton
                                onClick={() => setIsLogoutExpanded(!isLogoutExpanded)}
                                className="w-full flex items-center justify-between gap-3 text-destructive"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="h-5 w-5"/>
                                    <span>{isLogoutExpanded ? 'Выберите действие' : 'Выйти'}</span>
                                </div>
                                {isLogoutExpanded ? (
                                    <ChevronUp className="h-4 w-4"/>
                                ) : (
                                    <ChevronDown className="h-4 w-4"/>
                                )}
                            </SidebarMenuButton>

                            {isLogoutExpanded && (
                                <div className="pl-8 space-y-1">
                                    <button
                                        onClick={showSuccessToast(handleLogout,'Вы успешно вышли из аккаунта')}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                                    >
                                        <span>• Текущая сессия</span>
                                    </button>
                                    <button
                                        onClick={showSuccessToast(handleLogoutAll,'Вы успешно вышли из аккаунта на всех устройствах')}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-destructive"
                                    >
                                        <span>• Все устройства</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </SidebarMenuItem>

                    {/* Профиль пользователя */}
                    {user && (
                        <SidebarMenuItem>
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {(user.firstName?.[0] || 'U') + (user.lastName?.[0] || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                </div>
                            </div>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail/>
        </Sidebar>
    );
}
