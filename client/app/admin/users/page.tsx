"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  User as UserIcon,
  Loader2,
  Search,
  MoreVertical,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  phone: string;
  role: "ADMIN" | "CASHIER" | "NORMAL";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: "APPROVED" | "REJECTED",
  ) => {
    setProcessingId(id);
    try {
      await api.patch(`/users/${id}`, { status });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating user status");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20";
      case "REJECTED":
        return "bg-rose-50 text-rose-600 dark:bg-rose-900/20";
      default:
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-zinc-50 overflow-x-hidden">
      <div className="mx-auto max-w-lg px-6 py-8 pb-12">
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
                  User <span className="text-indigo-600">Access</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Management Dashboard
                </p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        </header>

        {/* Pending Approval Alert */}
        {!loading && users.filter((u) => u.status === "PENDING").length > 0 && (
          <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 dark:text-amber-100">
                  {users.filter((u) => u.status === "PENDING").length} Users
                  Pending
                </p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  Action required
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bento-card p-5 border-none shadow-sm relative group overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      {user.role === "ADMIN" && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-600 text-white border-2 border-white dark:border-slate-900">
                          <Shield className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight">
                        {user.name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400">
                        {user.phone}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest",
                            getStatusColor(user.status),
                          )}
                        >
                          {user.status === "PENDING" && (
                            <Clock className="h-2 w-2" />
                          )}
                          {user.status}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                        disabled={processingId === user.id}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-90 dark:shadow-none"
                      >
                        {processingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                        disabled={processingId === user.id}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90 dark:bg-white/5"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bento-card p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 dark:bg-slate-900">
              <Users className="h-8 w-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-black tracking-tight">
              No Users Found
            </h3>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
