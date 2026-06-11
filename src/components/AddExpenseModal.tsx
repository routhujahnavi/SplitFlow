"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { addExpense } from "@/app/actions";

export function AddExpenseModal({ isOpen, onClose, groups, profile }: { isOpen: boolean, onClose: () => void, groups: any[], profile: any }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [groupId, setGroupId] = useState("");
  const [payer, setPayer] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const selectedGroup = groups?.find(g => g.id === groupId);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("amount", amount);
      formData.append("groupId", groupId);
      formData.append("paidBy", payer || profile.id);
      
      // Select all members of the group as participants for equal split
      if (selectedGroup) {
        const participantIds = selectedGroup.group_members.map((m: any) => m.user_id).join(",");
        formData.append("participants", participantIds);
      }

      const res = await addExpense(formData);
      setLoading(false);
      
      if (res.error) {
        alert(res.error);
      } else {
        setStep(1);
        setTitle("");
        setAmount("");
        setGroupId("");
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-premium p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Step {step} of 3</h3>
          <button type="button" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input 
              type="text" 
              className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
              placeholder="Expense description" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input 
              type="number" 
              className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
              placeholder="Amount ($)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select 
              className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="" disabled>Select Group</option>
              {groups?.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <select 
              className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            >
              <option value="" disabled>Paid By</option>
              <option value={profile?.id}>You ({profile?.name})</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">The expense will be split equally among all group members.</p>
            <div className="divide-y divide-slate-800/40">
              {selectedGroup?.group_members?.map((m: any) => (
                 <div key={m.user_id} className="py-2 text-xs flex justify-between">
                   <span>{m.user_id === profile?.id ? "You" : "Group Member"}</span>
                   <input type="checkbox" defaultChecked disabled />
                 </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <div>Description: <span className="font-semibold">{title}</span></div>
              <div>Total Amount: <span className="font-bold text-purple-400">${amount}</span></div>
              <div>Paid By: <span className="font-medium">You</span></div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button 
            type="button" 
            onClick={handlePrev} 
            className={`h-10 px-4 rounded-xl bg-slate-900 text-xs text-slate-400 ${step === 1 ? 'visibility-hidden opacity-0' : ''}`}
          >
            Back
          </button>
          <button 
            type="button" 
            onClick={handleNext} 
            disabled={loading || (step === 1 && (!title || !amount || !groupId))}
            className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : step === 3 ? "Save Expense" : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
