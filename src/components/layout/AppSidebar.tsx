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
import {BookOpen, ChevronDown, ChevronUp, HelpCircle, Home, LogOut, Play, Trophy, Users,} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
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
    const location = useLocation();

    const {user, isAdmin} = useUserStore();
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
            {/* HEADER */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-lg font-bold"
                            onClick={() => navigate('/dashboard')}
                        >
                            <img src={logo} alt="Adaptive Learning" className="h-6 w-6"/>
                            <span className="font-semibold">Adaptive Learning</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent>
                {/* ОСНОВНЫЕ РАЗДЕЛЫ */}
                <SidebarGroup>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    isActive={location.pathname === item.url}
                                    onClick={() => navigate(item.url)}
                                >
                                    <item.icon className="h-5 w-5"/>
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* АДМИНКА */}
                {isAdmin() && (
                    <SidebarGroup>
                        <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70">
                            Администрирование
                        </div>

                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location.pathname.startsWith('/admin/users')}
                                    onClick={() => navigate('/admin/users')}
                                >
                                    <Users className="h-5 w-5"/>
                                    <span>Пользователи</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location.pathname.startsWith('/admin/tasks')}
                                    onClick={() => navigate('/admin/tasks')}
                                >
                                    <BookOpen className="h-5 w-5"/>
                                    <span>Задачи</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <SidebarMenu>
                    {/* LOGOUT */}
                    <SidebarMenuItem>
                        <div className="space-y-1">
                            <SidebarMenuButton
                                onClick={() => setIsLogoutExpanded(prev => !prev)}
                                className="w-full flex items-center justify-between gap-3 text-destructive"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="h-5 w-5"/>
                                    <span>
                                        {isLogoutExpanded ? 'Выберите действие' : 'Выйти'}
                                    </span>
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
                                        onClick={showSuccessToast(
                                            handleLogout,
                                            'Вы успешно вышли из аккаунта'
                                        )}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent transition-colors"
                                    >
                                        <span>• Текущая сессия</span>
                                    </button>

                                    <button
                                        onClick={showSuccessToast(
                                            handleLogoutAll,
                                            'Вы вышли со всех устройств'
                                        )}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent transition-colors text-destructive"
                                    >
                                        <span>• Все устройства</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </SidebarMenuItem>

                    {/* USER */}
                    {user && (
                        <SidebarMenuItem>
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors"
                            >
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
                            </button>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail/>
        </Sidebar>
    );
}