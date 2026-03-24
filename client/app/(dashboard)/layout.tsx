"use client";

import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Professional Sidebar - Desktop Only for now */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Bottom Navigation (optional/future) or just keep mobile as is */}
      
      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[88px]">
        {children}
      </div>
    </div>
  );
}
