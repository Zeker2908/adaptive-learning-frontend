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
import {BookOpen, ChevronDown, ChevronUp, HelpCircle, Home, LogOut, Play, Users,} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useAuthStore} from "@/store/authStore.ts";
import {useToast} from "@/hooks/useToast.ts";
import {useUserStore} from '@/store/userStore';
import logo from '@/assets/logo.svg';
import {useState} from 'react';
import {AnimatePresence, motion} from "framer-motion";

const items = [
    {title: "Главная", url: "/dashboard", icon: Home},
    {title: "Персональный трек", url: "/task-stream", icon: Play},
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
                            <img src={logo} alt="AdaptCode" className="h-6 w-6"/>
                            <span className="font-semibold">AdaptCode</span>
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

                                {/* 🔹 Анимированный чекрон */}
                                <motion.div
                                    animate={{rotate: isLogoutExpanded ? 180 : 0}}
                                    transition={{duration: 0.2}}
                                >
                                    {isLogoutExpanded ? (
                                        <ChevronUp className="h-4 w-4"/>
                                    ) : (
                                        <ChevronDown className="h-4 w-4"/>
                                    )}
                                </motion.div>
                            </SidebarMenuButton>

                            {/* 🔹 Анимированный выпадающий список */}
                            <AnimatePresence initial={false}>
                                {isLogoutExpanded && (
                                    <motion.div
                                        key="logout-options"
                                        initial={{opacity: 0, height: 0, y: -4}}
                                        animate={{opacity: 1, height: 'auto', y: 0}}
                                        exit={{opacity: 0, height: 0, y: -4}}
                                        transition={{duration: 0.2}}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-8 pt-1 space-y-1">
                                            {/* 🔹 Кнопки с каскадным появлением */}
                                            <motion.div
                                                initial={{opacity: 0, x: -8}}
                                                animate={{opacity: 1, x: 0}}
                                                transition={{delay: 0.05}}
                                            >
                                                <button
                                                    onClick={showSuccessToast(
                                                        handleLogout,
                                                        'Вы успешно вышли из аккаунта'
                                                    )}
                                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent transition-colors text-left"
                                                >
                                                    <span className="text-muted-foreground">•</span>
                                                    <span>Текущая сессия</span>
                                                </button>
                                            </motion.div>

                                            <motion.div
                                                initial={{opacity: 0, x: -8}}
                                                animate={{opacity: 1, x: 0}}
                                                transition={{delay: 0.1}}
                                            >
                                                <button
                                                    onClick={showSuccessToast(
                                                        handleLogoutAll,
                                                        'Вы вышли со всех устройств'
                                                    )}
                                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent transition-colors text-destructive text-left"
                                                >
                                                    <span>•</span>
                                                    <span>Все устройства</span>
                                                </button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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