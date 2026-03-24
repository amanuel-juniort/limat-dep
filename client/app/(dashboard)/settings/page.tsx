"use client";

import React, { useState } from "react";
import { 
  User, 
  Settings as SettingsIcon, 
  Monitor, 
  Moon, 
  Sun, 
  Shield, 
  Database,
  Bell,
  Save,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "terminal", label: "Terminal", icon: Monitor },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <main className="mx-auto max-w-6xl p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
          System Configuration
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  activeTab === tab.id
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <ChevronRight className="ml-auto h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <div className="bento-card border-none bg-white p-8 dark:bg-slate-900 shadow-sm">
              <h3 className="text-lg font-black tracking-tight mb-6">User Profile</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    disabled
                    value={user?.phone}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-100/50 p-4 text-sm font-bold text-slate-400 cursor-not-allowed dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Role</label>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold text-indigo-600 dark:bg-slate-950 dark:border-slate-800">
                    {user?.role}
                  </div>
                </div>
              </div>
              <button className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white hover:bg-indigo-700 transition-all active:scale-[0.98]">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "terminal" && (
            <div className="bento-card border-none bg-white p-8 dark:bg-slate-900 shadow-sm">
              <h3 className="text-lg font-black tracking-tight mb-6">Terminal Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Appearance</p>
                    <p className="text-xs text-slate-400 font-medium">Toggle between light and dark themes</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all dark:bg-slate-800">
                      <Sun className="h-4 w-4" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                      <Moon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Printer Selection</p>
                    <p className="text-xs text-slate-400 font-medium">Choose default receipt printer</p>
                  </div>
                  <select className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs font-bold dark:bg-slate-950 dark:border-slate-800 outline-none">
                    <option>Network Printer 01</option>
                    <option>USB Thermal Printer</option>
                    <option>PDF Export</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div className="bento-card border-none bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black tracking-tight mb-2">System Alpha Node</h3>
              <p className="text-xs font-medium text-indigo-100 max-w-sm">
                This terminal is registered as a secure node. Version 3.4.2-STARK.
              </p>
            </div>
            <Database className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </main>
  );
}
