// components/layout/DashboardLayout.tsx
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/layout/AppSidebar";
import React from "react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function RootLayout({children}: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <main className="flex min-h-screen w-full flex-col bg-linear-to-br from-gray-50 to-gray-100">
                <header className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
                    <SidebarTrigger />
                    <h1 className="text-xl font-semibold">Adaptive Learning</h1>
                </header>
                <div className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
