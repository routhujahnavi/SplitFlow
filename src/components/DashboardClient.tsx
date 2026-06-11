"use client";

import { useState } from "react";
import { Plus, Wallet, ArrowDownLeft, ArrowUpRight, Users, UserPlus } from "lucide-react";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { SpendingChart } from "@/components/SpendingChart";
import Link from "next/link";

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
};


export function DashboardClient({ profile, groups, expenses }: { profile: any, groups: any[], expenses: any[] }) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Calculate some simple balances
  const totalSpent = expenses?.reduce((acc, exp) => acc + (exp.paid_by === profile.id ? Number(exp.amount) : 0), 0) || 0;
  const totalOwedToYou = expenses?.reduce((acc, exp) => acc + (exp.paid_by === profile.id ? Number(exp.amount) * (groups?.find(g => g.id === exp.group_id)?.group_members?.length - 1 || 0) / (groups?.find(g => g.id === exp.group_id)?.group_members?.length || 1) : 0), 0) || 0;
  const totalYouOwe = expenses?.reduce((acc, exp) => acc + (exp.paid_by !== profile.id ? Number(exp.amount) / (groups?.find(g => g.id === exp.group_id)?.group_members?.length || 1) : 0), 0) || 0;
  const netBalance = totalOwedToYou - totalYouOwe;

  return (
    <>
      <div className="space-y-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase font-bold tracking-widest text-purple-500/90 dark:text-purple-400/90">
              DASHBOARD
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Welcome back, {profile?.name?.split(" ")[0] || "User"}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-4 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-sm font-medium shadow-lg shadow-purple-600/10 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-premium shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Balance</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-3xl font-bold font-mono tracking-tight ${netBalance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {netBalance >= 0 ? '+' : '-'}₹{Math.abs(netBalance).toFixed(2)}
            </p>
          </div>
          <div className="glass-panel p-6 rounded-premium shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">You Owe</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-mono tracking-tight text-accent-rose">-₹{totalYouOwe.toFixed(2)}</p>
          </div>
          <div className="glass-panel p-6 rounded-premium shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">You are Owed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-mono tracking-tight text-accent-emerald">+₹{totalOwedToYou.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex flex-wrap gap-3 items-center justify-between">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase px-2">Quick Actions:</span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
            <Link href="/dashboard/groups" className="h-9 px-4 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 text-xs font-medium transition-all flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Create Group
            </Link>
            <Link href="/dashboard/friends" className="h-9 px-4 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-medium transition-all flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Add Friend
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-premium shadow-sm">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-2">Spending Trends</h3>
              <SpendingChart expenses={expenses} currentUserId={profile.id} />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 px-1">Recent Activity</h3>
              <div className="glass-panel rounded-premium shadow-sm divide-y divide-slate-800/40 overflow-hidden">
                {expenses && expenses.length > 0 ? (
                  expenses.map(exp => (
                    <div key={exp.id} className="p-4 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{exp.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{formatDate(exp.created_at)}</p>
                      </div>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">₹{Number(exp.amount).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-slate-500 italic text-center py-8">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-premium shadow-sm space-y-6">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Your Groups</h3>
              <div className="space-y-4">
                {groups && groups.length > 0 ? (
                  groups.map(g => (
                    <Link key={g.id} href={`/dashboard/groups/${g.id}`} className="block hover:bg-slate-800/20 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{g.name}</p>
                        <span className="text-xs text-slate-500">{g.group_members?.length} members</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No groups available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        groups={groups}
        profile={profile}
      />
    </>
  );
}
