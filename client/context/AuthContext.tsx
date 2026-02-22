"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types/pos"; // I need to update pos.ts for User type later or use any for now

interface AuthContextType {
  user: any | null; // Will refine to User type
  loading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    if (pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      } else if (pathname !== "/login" && !loading) {
        // router.push('/login'); // We'll enable this Once login page exists
      }
      setLoading(false);
    };
    checkAuth();
  }, [pathname, loading]);

  // Handle redirects when loading finishes
  useEffect(() => {
    const normalizedPath = pathname?.toLowerCase().replace(/\/$/, "") || "";
    const publicRoutes = ["/login", "/signup"];

    if (!loading && !user && !publicRoutes.includes(normalizedPath)) {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  const login = (token: string, userData: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
