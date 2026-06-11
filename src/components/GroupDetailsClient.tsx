"use client";

import { useState } from "react";
import { Users, Receipt, ArrowLeft, UserPlus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddGroupMemberModal } from "@/components/AddGroupMemberModal";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { deleteGroup, deleteExpense } from "@/app/actions";

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
};


export function GroupDetailsClient({ group, expenses, friends, profile }: { group: any, expenses: any[], friends: any[], profile: any }) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? All expenses inside will be permanently deleted.")) return;
    setIsDeleting(true);
    const res = await deleteGroup(group.id);
    setIsDeleting(false);
    if (res.error) {
      alert(res.error);
    } else {
      router.push("/dashboard/groups");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;
    const res = await deleteExpense(expenseId, group.id);
    if (res.error) alert(res.error);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start pb-4 border-b border-slate-800/40">
        <div>
          <Link href="/dashboard/groups" className="text-xs text-purple-500 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Groups
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">{group.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{group.description || "No description provided."}</p>
        </div>
        <div className="flex gap-2">
          {group.created_by === profile.id && (
            <button 
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="h-10 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> {isDeleting ? "Deleting..." : "Delete Group"}
            </button>
          )}
          <button 
            onClick={() => setIsAddMemberOpen(true)}
            className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
          <button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="h-10 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Group Expenses</h3>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="glass-panel p-4 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{expense.title}</p>
                      <p className="text-xs text-slate-500">Paid by {expense.profiles?.name || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100">₹{expense.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{formatDate(expense.created_at)}</p>
                    <button 
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-rose-500 hover:text-rose-600 mt-1 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="p-8 text-center text-slate-500 glass-panel rounded-premium text-sm">
                No expenses yet. Add one to get started!
             </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Members</h3>
          <div className="glass-panel p-4 rounded-xl space-y-3">
            {group.group_members?.map((member: any) => (
              <div key={member.user_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-xs">
                  {member.profiles?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.profiles?.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{member.profiles?.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddGroupMemberModal 
        isOpen={isAddMemberOpen} 
        onClose={() => setIsAddMemberOpen(false)} 
        groupId={group.id} 
        friends={friends} 
      />
      
      {/* AddExpenseModal expects an array of groups, we can just pass this single group */}
      <AddExpenseModal 
        isOpen={isAddExpenseOpen} 
        onClose={() => setIsAddExpenseOpen(false)} 
        groups={[group]} 
        profile={profile} 
      />
    </div>
  );
}
