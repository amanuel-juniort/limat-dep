"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  ShoppingCart,
  LogIn,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullPhone = `+251${phone}`;

    try {
      const response = await api.post("/auth/login", {
        phone: fullPhone,
        password,
      });
      const { access_token, user } = response.data;
      login(access_token, user);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bento-card p-10 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Limat <span className="text-indigo-600">Terminal</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Authorized access only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-center text-xs font-bold text-rose-600 animate-in shake duration-300">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-black border-r border-slate-200 dark:border-slate-800 pr-2">
                    +251
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="9112233..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 py-4 pl-24 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 py-4 pl-11 pr-11 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest text-[10px]"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">
            System Alpha Node v3.4
          </p>
        </div>
      </div>
    </div>
  );
}
