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
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  Gift,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Home() {
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingUsers: 0,
    todayRevenue: 0,
    todaySales: 0,
    todayTips: 0,
    loading: true,
  });

  const fetchData = async () => {
    try {
      let pendingUsers = 0;
      let todayRevenue = 0;
      let todaySales = 0;
      let todayTips = 0;

      if (user?.role === "ADMIN") {
        const [pendingRes, summaryRes] = await Promise.all([
          api.get("/users/pending-count"),
          api.get("/reports/summary"),
        ]);
        
        pendingUsers = pendingRes.data?.count || 0;
        todayRevenue = summaryRes.data?.totalRevenue || 0;
        todaySales = summaryRes.data?.salesCount || 0;
        todayTips = summaryRes.data?.totalTips || 0;
      }

      setStats({
        pendingUsers,
        todayRevenue,
        todaySales,
        todayTips,
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

      <main className="max-w-7xl px-8 py-10">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            System Operational
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h2>
        </div>

        {/* Desktop Stats Row - Admin Only */}
        {user?.role === "ADMIN" && (
          <div className="hidden md:grid grid-cols-4 gap-4 mb-10">
            <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Revenue</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {stats.loading ? "..." : `${stats.todayRevenue.toLocaleString()} ETB`}
              </p>
            </div>

            <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Sales</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {stats.loading ? "..." : stats.todaySales}
              </p>
            </div>

            <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                  <HandCoins className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tips Collected</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {stats.loading ? "..." : `${stats.todayTips.toLocaleString()} ETB`}
              </p>
            </div>

            <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-800">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {stats.loading ? "..." : stats.pendingUsers}
                </p>
                {stats.pendingUsers > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}


        {/* Navigation List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 md:col-span-2 lg:col-span-3">
            Manage Terminal
          </p>
          {[
            {
              label: "Sale",
              href: "/pos",
              icon: ShoppingCart,
              color: "bg-indigo-600",
              subtitle: "Process transactions",
            },
            {
              label: "Inventory Storage",
              href: "/inventory",
              icon: Package,
              color: "bg-emerald-600",
              subtitle: "Manage products",
            },
            {
              label: "Report",
              href: "/reports",
              icon: BarChart3,
              color: "bg-blue-600",
              subtitle: "View daily totals",
            },
            {
              label: "Terminal Settings",
              href: "/settings",
              icon: Settings,
              color: "bg-slate-600",
              subtitle: "Configure system",
            },
            ...(user?.role === "ADMIN"
              ? [
                  {
                    label: "Admin Control",
                    href: "/admin/users",
                    icon: ShieldAlert,
                    color: "bg-rose-600",
                    badgeCount: stats.pendingUsers,
                    subtitle: "Manage users",
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
                    {(item as any).subtitle || "System Node Access"}
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
