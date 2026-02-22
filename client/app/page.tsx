"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  RotateCw,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Home() {
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingUsers: 0,
    loading: true,
  });

  const fetchData = async () => {
    try {
      let pendingUsers = 0;

      // Only fetch pending users for ADMIN
      if (user?.role === "ADMIN") {
        const response = await api.get("/users/pending-count");
        pendingUsers = response.data?.count || 0;
      }

      setStats({
        pendingUsers,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-zinc-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight">
            Limat <span className="text-indigo-600">Terminal</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RotateCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </button>

          <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 p-1 pr-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || "U"}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {user?.name || "User"}
            </span>
            <button
              onClick={logout}
              className="ml-1 text-slate-400 hover:text-rose-500 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-6 pb-24">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            System Operational
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h2>
        </div>


        {/* Navigation List */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Manage Terminal
          </p>
          {[
            {
              label: "Sale",
              href: "/pos",
              icon: ShoppingCart,
              color: "bg-indigo-600",
            },
            {
              label: "Inventory Storage",
              href: "/inventory",
              icon: Package,
              color: "bg-emerald-600",
            },
            {
              label: "Report",
              href: "/reports",
              icon: BarChart3,
              color: "bg-blue-600",
            },
            {
              label: "Terminal Settings",
              href: "#",
              icon: Settings,
              color: "bg-slate-600",
            },
            ...(user?.role === "ADMIN"
              ? [
                  {
                    label: "Admin Control",
                    href: "/admin/users",
                    icon: ShieldAlert,
                    color: "bg-rose-600",
                    badgeCount: stats.pendingUsers,
                  },
                ]
              : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-2xl bg-white p-4 transition-all hover:ring-2 hover:ring-indigo-600/10 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-indigo-100 dark:shadow-none",
                    item.color,
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    {item.label}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                    System Node Access
                  </p>
                </div>
              </div>
              {(item as any).badgeCount && (item as any).badgeCount > 0 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-200 dark:shadow-none animate-in zoom-in duration-300">
                  {(item as any).badgeCount}
                </div>
              ) : (
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
