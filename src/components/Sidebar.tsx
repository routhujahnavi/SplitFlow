"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Users, UserPlus, History, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Your Groups", href: "/dashboard/groups", icon: Users },
    { name: "Friends", href: "/dashboard/friends", icon: UserPlus },
    { name: "Recent History", href: "/dashboard/history", icon: History },
    { name: "Your Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200/40 dark:border-slate-800/40 p-6 space-y-8 sticky top-0 h-screen z-20">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
          <Activity className="w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          SplitFlow
        </span>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-purple-600 bg-purple-500/10 dark:text-purple-400"
                  : "text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-900/40"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-inner">
            {profile?.name?.substring(0, 2).toUpperCase() || "??"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{profile?.name || "User"}</p>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate">{profile?.split_id || "Loading..."}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-accent-rose transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-rose-500/10"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Sign Out</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
