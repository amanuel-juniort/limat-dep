"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  LogOut,
  User,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShoppingCart, label: "POS", href: "/pos" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: ShieldAlert, label: "Admin", href: "/admin/users", adminOnly: true },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[88px] flex-col items-center border-r border-slate-100 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
      {/* Brand Logo */}
      <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none">
        <ShoppingCart className="h-6 w-6 text-white" />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col items-center gap-4">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== "ADMIN") return null;
          
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              
              {/* Tooltip-like label on hover */}
              <span className="absolute left-[70px] z-50 scale-0 rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all group-hover:scale-100 dark:bg-white dark:text-slate-950">
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute -left-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors dark:hover:bg-slate-900">
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="h-10 w-10 overflow-hidden rounded-2xl border-2 border-slate-50 dark:border-slate-800">
          <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-[10px] font-black text-indigo-600">
            {user?.name?.[0] || <User className="h-4 w-4" />}
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors dark:hover:bg-rose-950/20"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
