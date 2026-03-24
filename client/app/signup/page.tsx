"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Phone,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import api from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const fullPhone = `+251${formData.phone}`;

    try {
      await api.post("/auth/signup", {
        name: formData.name,
        phone: fullPhone,
        password: formData.password,
      });
      setSuccess(true);
      // Wait a bit then redirect to login
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-10 text-center shadow-2xl dark:bg-slate-900 animate-in zoom-in duration-300">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-100 dark:shadow-none">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Request Sent!
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Your account is pending approval. An administrator will review your
            request soon.
          </p>
          <div className="mt-8">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-indigo-600" />
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Redirecting to Login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 font-sans">
      {/* Brand Section - Visible on Desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-950">
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
          style={{ 
            backgroundImage: "url('/brand-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-slate-950/90 z-10" />
        
        <div className="relative z-20 flex flex-col justify-between p-16 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20">
              <UserPlus className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Limat <span className="text-indigo-400">Terminal</span>
            </span>
          </div>

          <div>
            <h2 className="text-5xl font-black tracking-tighter leading-tight">
              Join the <br />
              <span className="text-indigo-400">Network.</span>
            </h2>
            <p className="mt-6 text-lg font-medium text-slate-300 max-w-md">
              Secure your spot in the ecosystem. Every node counts towards a more efficient retail future.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] text-indigo-400">Security First</p>
                <p className="text-sm font-medium text-slate-400">Role-based access control and encrypted transactions.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] text-emerald-400">Simple Approval</p>
                <p className="text-sm font-medium text-slate-400">Fast-track verification from system administrators.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 lg:bg-white">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 lg:shadow-none lg:p-0 lg:bg-transparent lg:border-none">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none lg:hidden">
              <UserPlus className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              Create <span className="text-indigo-600">Account.</span>
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Fill in your details to request access to the terminal.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-500 dark:bg-rose-900/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Abebe Bikila"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-950 dark:border-slate-800"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors z-10 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-black border-r border-slate-200 dark:border-slate-800 pr-2">
                    +251
                  </span>
                </div>
                <input
                  required
                  type="tel"
                  placeholder="9112233..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 pl-24 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-950 dark:border-slate-800"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Create Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-950 dark:border-slate-800"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-950 dark:border-slate-800"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 dark:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Request Signup
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center underline-offset-4">
            <p className="text-xs font-bold text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
