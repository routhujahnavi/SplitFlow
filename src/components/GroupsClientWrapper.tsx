"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { CreateGroupModal } from "@/components/CreateGroupModal";

export function GroupsClientWrapper({ groups }: { groups: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/40">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Groups</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your friends and groups.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups && groups.length > 0 ? (
          groups.map((g) => (
            <Link key={g.id} href={`/dashboard/groups/${g.id}`}>
              <div className="glass-panel p-6 rounded-premium cursor-pointer hover:border-purple-500/40 hover:bg-white/5 dark:hover:bg-slate-800/50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm">{g.name}</h4>
                    <p className="text-xs text-slate-500 mt-2">{g.group_members?.length || 0} members</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-slate-500 glass-panel rounded-premium text-sm">
            No clusters found. Initialize a new cluster to start splitting expenses.
          </div>
        )}
      </div>

      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
