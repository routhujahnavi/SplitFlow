"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createGroup } from "@/app/actions";

export function CreateGroupModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("name", name);
    
    const res = await createGroup(formData);
    
    setLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 rounded-premium space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold">Create a Group</h3>
          <button type="button" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
            placeholder="Group Name" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
