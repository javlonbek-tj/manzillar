// components/dashboard/DashboardWrapper.tsx
"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderActions } from "@/components/header-actions";
import { Separator } from "@/components/ui/separator";

export function DashboardWrapper({ 
  children, 
  title = "Dashboard" 
}: { 
  children: React.ReactNode;
  title?: string;
}) {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <>
      <header className='flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 transition-all duration-300'>
        <h1 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>{title}</h1>
        <HeaderActions />
      </header>
      <main
        className={cn(
          "flex-1 overflow-y-auto p-4 sm:p-6 transition-colors",
          darkMode ? "bg-gray-900" : "bg-blue-50"
        )}
      >
        {children}
      </main>
    </>
  );
}
