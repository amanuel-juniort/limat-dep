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
  User,
  ArrowUpRight,
  TrendingUp,
  Activity,
  RotateCw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Home() {
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    salesCount: number;
    stockPercent: number;
    loading: boolean;
    recentTransactions: any[];
    pendingUsers: number;
  }>({
    totalRevenue: 0,
    salesCount: 0,
    stockPercent: 100,
    loading: true,
    recentTransactions: [],
    pendingUsers: 0,
  });

  const fetchData = async () => {
    try {
      const endpoints: any[] = [
        api.get("/reports/daily"),
        api.get("/reports/inventory"),
        api.get("/sales"),
      ];

      // Only fetch pending users for ADMIN
      if (user?.role === "ADMIN") {
        endpoints.push(api.get("/users/pending-count"));
      }

      const responses = await Promise.all(endpoints);
      const [dailyRes, invRes, salesRes] = responses;

      const inv = invRes.data;
      const lowStock = inv.filter((i: any) => i.currentStock < 5).length;
      const stockPercent =
        inv.length > 0
          ? Math.round(((inv.length - lowStock) / inv.length) * 100)
          : 100;

      const pendingUsers =
        user?.role === "ADMIN" ? responses[3]?.data?.count || 0 : 0;

      setStats({
        totalRevenue: Number(dailyRes.data.totalRevenue),
        salesCount: Number(dailyRes.data.salesCount || 0),
        stockPercent,
        loading: false,
        recentTransactions: salesRes.data,
        pendingUsers,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

        {/* Hero Stats Section */}
        <div className="bento-card mb-6 p-6 border-none shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <div className="flex items-center justify-between opacity-80">
            <p className="text-xs font-bold uppercase tracking-widest">
              Total Revenue
            </p>
            <TrendingUp className="h-4 w-4" />
          </div>
          <h4 className="mt-4 text-4xl font-black tabular-nums tracking-tight">
            {stats.totalRevenue.toFixed(2)}{" "}
            <span className="text-lg opacity-60">ETB</span>
          </h4>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white shadow-[0_0_10px_white]"
                style={{ width: `${stats.stockPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold">
              {stats.stockPercent}% Target
            </span>
          </div>
        </div>

        {/* Mini Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="bento-card p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Transactions
            </p>
            <p className="mt-1 text-xl font-black">
              {stats.salesCount}{" "}
              <span className="text-xs opacity-40">Orders</span>
            </p>
          </div>
          <div className="bento-card p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Inventory Health
            </p>
            <p className="mt-1 text-xl font-black">
              {stats.stockPercent}%{" "}
              <span className="text-xs opacity-40">Good</span>
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 ml-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Recent Transactions
            </p>
            <Link
              href="/reports"
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentTransactions.length === 0 ? (
              <div className="bento-card p-8 text-center bg-white/50 border-dashed dark:bg-white/5">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  No Activity Today
                </p>
              </div>
            ) : (
              stats.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bento-card p-4 flex items-center justify-between group hover:ring-2 hover:ring-indigo-600/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-white",
                        tx.type === "SALE" ? "bg-indigo-600" : "bg-purple-600",
                      )}
                    >
                      {tx.type === "SALE" ? (
                        <ShoppingCart className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">
                        {tx.type === "SALE"
                          ? tx.items?.map((i: any) => i.item.name).join(", ") ||
                            "Sale"
                          : `Spin: ${tx.spinResult || "Reward"}`}
                      </h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {new Date(tx.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {tx.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tabular-nums">
                      {Number(tx.totalAmount).toFixed(2)}
                    </p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase">
                      ETB
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Manage Terminal
          </p>
          {[
            {
              label: "POS Terminal",
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
              label: "Business Analytics",
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
