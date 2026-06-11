"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { addGroupMember } from "@/app/actions";

export function AddGroupMemberModal({ isOpen, onClose, groupId, friends }: { isOpen: boolean, onClose: () => void, groupId: string, friends: any[] }) {
  const [friendId, setFriendId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("friendId", friendId);

    const res = await addGroupMember(formData);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      setFriendId("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-premium p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-purple-500">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Add Member</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <select
              required
              className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
            >
              <option value="" disabled>Select a Friend</option>
              {friends?.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading || !friendId}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add to Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
