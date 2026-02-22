"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  Download,
  TrendingUp,
  ShoppingCart,
  RotateCw,
  Filter,
  Loader2,
  DollarSign,
  Package,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, salesRes] = await Promise.all([
        api.get("/reports/daily"),
        api.get("/sales"),
      ]);
      setSummary(summaryRes.data);
      setTransactions(salesRes.data);
    } catch (error) {
      console.error("Failed to fetch reports data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="mt-4 font-black uppercase tracking-widest opacity-40">
          Compiling Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-zinc-50 overflow-x-hidden p-6">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all shadow-sm active:scale-95 dark:bg-slate-900 dark:border-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  Business <span className="text-indigo-600">Analytics</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Performance Report
                </p>
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 transition-all dark:bg-white dark:text-black">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Compact Metric Cards */}
        <div className="grid gap-4 mb-8 grid-cols-2">
          <div className="bento-card p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3 w-3 text-indigo-600" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Revenue
              </p>
            </div>
            <h3 className="text-lg font-black tabular-nums">
              {Number(summary?.totalRevenue || 0).toFixed(0)}{" "}
              <span className="text-[10px] opacity-30">ETB</span>
            </h3>
          </div>

          <div className="bento-card p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3 w-3 text-emerald-600" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Profit
              </p>
            </div>
            <h3 className="text-lg font-black tabular-nums text-emerald-600">
              {Number(summary?.grossProfit || 0).toFixed(0)}{" "}
              <span className="text-[10px] opacity-30">ETB</span>
            </h3>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="bento-card p-6 border-none shadow-sm relative overflow-hidden mb-8">
          <h3 className="text-sm font-black tracking-tight mb-6 uppercase text-slate-400 tabular-nums">
            Daily Breakdown
          </h3>

          <div className="space-y-5">
            {[
              {
                label: "Sales Revenue",
                value: summary?.salesRevenue,
                color: "text-slate-900 dark:text-white",
                icon: ShoppingCart,
              },
              {
                label: "Spin Revenue",
                value: summary?.spinRevenue,
                color: "text-indigo-600",
                icon: RotateCw,
              },
              {
                label: "Total Tips",
                value: summary?.totalTips,
                color: "text-emerald-500",
                icon: DollarSign,
              },
              {
                label: "Inventory COGS",
                value: -(summary?.totalCOGS || 0),
                color: "text-rose-500",
                icon: Package,
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                    {React.createElement(row.icon, {
                      className: cn("h-3.5 w-3.5", row.color),
                    })}
                  </div>
                  <p className="font-bold text-xs text-slate-600 dark:text-slate-300">
                    {row.label}
                  </p>
                </div>
                <p className={cn("text-sm font-black tabular-nums", row.color)}>
                  {Number(row.value || 0).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="h-[1px] w-full bg-slate-50 dark:bg-slate-800 my-4" />

            <div className="flex justify-between items-end bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-1">
                  Net Daily Profit
                </p>
                <h4 className="text-3xl font-black tracking-tighter tabular-nums text-indigo-600">
                  {Number(summary?.grossProfit || 0).toFixed(2)}
                </h4>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-indigo-600 text-white">
                High Margin
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">
            Recent Activity
          </p>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bento-card p-4 flex items-center justify-between bg-white dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center text-white",
                      tx.type === "SALE" ? "bg-indigo-600" : "bg-purple-600",
                    )}
                  >
                    {tx.type === "SALE" ? (
                      <ShoppingCart className="h-3 w-3" />
                    ) : (
                      <RotateCw className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-tight">
                      {tx.type === "SALE"
                        ? tx.items?.map((i: any) => i.item.name).join(", ") ||
                          "Standard Sale"
                        : `Wheel: ${tx.spinResult || "Reward"}`}
                    </h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {tx.user?.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black tabular-nums">
                  {Number(tx.totalAmount).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
