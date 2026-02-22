"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Calendar as CalendarIcon,
  TrendingUp,
  Wallet,
  Gamepad2,
  Coins,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Printer,
  ShoppingCart,
  RotateCw,
  Package,
  DollarSign,
  Gift,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface DailySummary {
  date: string;
  totalRevenue: number;
  salesRevenue: number;
  salesCount: number;
  spinRevenue: number;
  spinCount: number;
  totalTips: number;
  grossProfit: number;
  totalCOGS: number;
  marketingCost: number;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, salesRes] = await Promise.all([
        api.get(`/reports/daily?date=${selectedDate}`),
        api.get("/sales"), // We might want a date filter for sales too eventually
      ]);
      setSummary(summaryRes.data);
      setTransactions(salesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch reports data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(value);

  const handlePrint = () => {
    window.print();
  };

  const adjustDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-zinc-50 overflow-x-hidden p-6 print:p-0 print:bg-white print:text-black">
      <div className="mx-auto max-w-lg print:max-w-none">
        {/* Header - Hidden in Print */}
        <header className="mb-8 flex flex-col gap-6 print:hidden">
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
                  Daily Performance
                </p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex-1">
              <button
                onClick={() => adjustDate(-1)}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex flex-1 items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                <CalendarIcon className="h-3 w-3 text-indigo-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-center outline-none cursor-pointer"
                />
              </div>
              <button
                onClick={() => adjustDate(1)}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 dark:shadow-none dark:bg-indigo-600"
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Print Header - Visible only in Print */}
        <div className="hidden print:block mb-10 text-center border-b pb-8 border-slate-200">
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">
            Limat Terminal Report
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Daily Summary ·{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              dateStyle: "full",
            })}
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center print:hidden">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Primary Stat Card */}
            <div className="bento-card overflow-hidden border-none bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-100 dark:shadow-none print:bg-slate-50 print:text-black print:border print:border-slate-200 print:shadow-none">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 print:opacity-100">
                  Total Transactions
                </p>
                <h2 className="mt-2 text-4xl font-black tracking-tighter print:text-3xl">
                  {formatMoney(summary.totalRevenue)}
                </h2>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-100 print:text-slate-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Gross Profit: {formatMoney(summary.grossProfit)}</span>
                </div>
              </div>
              <BarChart3 className="absolute -bottom-6 -right-6 h-32 w-32 opacity-10 print:hidden" />
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
              <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900 print:border print:border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 mb-3">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    POS Sales
                  </p>
                  <h3 className="text-lg font-black mt-1">
                    {formatMoney(summary.salesRevenue)}
                  </h3>
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-400">
                  {summary.salesCount} Tickets
                </p>
              </div>

              <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900 print:border print:border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 mb-3">
                    <Gamepad2 className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Spin Revenue
                  </p>
                  <h3 className="text-lg font-black mt-1">
                    {formatMoney(summary.spinRevenue)}
                  </h3>
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-400">
                  {summary.spinCount} Spins
                </p>
              </div>

              <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900 print:border print:border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 mb-3">
                    <Coins className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Tips
                  </p>
                  <h3 className="text-lg font-black mt-1">
                    {formatMoney(summary.totalTips)}
                  </h3>
                </div>
              </div>

              <div className="bento-card p-5 border-none shadow-sm dark:bg-slate-900 print:border print:border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 mb-3">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Profit Margin
                  </p>
                  <h3 className="text-lg font-black mt-1 text-emerald-600">
                    {summary.totalRevenue > 0
                      ? Math.round(
                          (summary.grossProfit / summary.totalRevenue) * 100,
                        )
                      : 0}
                    %
                  </h3>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="bento-card p-6 border-none shadow-sm dark:bg-slate-900 print:border print:border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                Financial Summary
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <ShoppingCart className="h-3.5 w-3.5" /> Sales Revenue
                  </div>
                  <span className="font-black tabular-nums">
                    {formatMoney(summary.salesRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <RotateCw className="h-3.5 w-3.5" /> Spin Revenue
                  </div>
                  <span className="font-black tabular-nums">
                    {formatMoney(summary.spinRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Package className="h-3.5 w-3.5" /> Inventory COGS
                  </div>
                  <span className="font-black tabular-nums text-rose-500">
                    -{formatMoney(summary.totalCOGS)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Gift className="h-3.5 w-3.5" /> Marketing Cost
                  </div>
                  <span className="font-black tabular-nums text-rose-500">
                    -{formatMoney(summary.marketingCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Net Gross Profit
                  </span>
                  <span className="text-xl font-black text-emerald-500 tabular-nums">
                    {formatMoney(summary.grossProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Feed - Hidden in Print (Optional - keep for context) */}
            <div className="mt-8 print:hidden">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">
                Recent Transactions
              </p>
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="bento-card p-4 flex items-center justify-between bg-white dark:bg-slate-900 border-none shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center text-white",
                          tx.type === "SALE"
                            ? "bg-indigo-600"
                            : "bg-purple-600",
                        )}
                      >
                        {tx.type === "SALE" ? (
                          <ShoppingCart className="h-3.5 w-3.5" />
                        ) : (
                          <RotateCw className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-tight">
                          {tx.type === "SALE"
                            ? tx.items
                                ?.map((i: any) => i.item.name)
                                .join(", ") || "Standard Sale"
                            : `Wheel: ${tx.spinResult || "Reward"}`}
                        </h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {tx.user?.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black tabular-nums">
                      {Math.round(tx.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Note - Print Only */}
            <div className="hidden print:block text-[10px] font-bold text-slate-400 text-center mt-12 border-t pt-8 italic">
              Limat Terminal Daily Reconciliation Report · Generated on{" "}
              {new Date().toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="bento-card p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 dark:bg-slate-900">
              <BarChart3 className="h-8 w-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              No Data Available
            </h3>
            <p className="mt-2 text-xs text-slate-400 font-medium font-bold">
              There are no transactions for the selected date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
