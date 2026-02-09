// /components/layout/AppSidebar.tsx
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
import {BookOpen, HelpCircle, Home, LogOut, Play, Settings, Trophy, Users} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useAuthStore} from "@/store/authStore.ts";
import {useToast} from "@/hooks/useToast.ts";
import {useUserStore} from '@/store/userStore';
import logo from '@/assets/logo.svg';

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
    const {logout} = useAuthStore();
    const {showSuccessToast} = useToast();

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

                    {/* Кнопка "Выйти" */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            onClick={showSuccessToast(
                                () => logout(),
                                'Вы успешно вышли из аккаунта'
                            )}
                        >
                            <button className="w-full flex items-center gap-3 text-destructive">
                                <LogOut className="h-5 w-5"/>
                                <span>Выйти</span>
                            </button>
                        </SidebarMenuButton>
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
