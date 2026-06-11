"use client";

import { useState, useEffect } from "react";
import { bindFriend } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

export default function FriendsPage() {
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFriends() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: data1 } = await supabase
        .from("friends")
        .select(`*, profiles!friends_friend_id_fkey(*)`)
        .eq("user_id", user.id);
        
      const { data: data2 } = await supabase
        .from("friends")
        .select(`*, profiles!friends_user_id_fkey(*)`)
        .eq("friend_id", user.id);
        
      const combined = [
        ...(data1?.map(f => ({ ...f, profile: f.profiles })) || []),
        ...(data2?.map(f => ({ ...f, profile: f.profiles })) || [])
      ];
      
      setFriendsList(combined);
      setLoading(false);
    }
    fetchFriends();
  }, [supabase]);

  async function handleBind(formData: FormData) {
    setIsSubmitting(true);
    const res = await bindFriend(formData);
    setIsSubmitting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      // Reload page to reflect new friends
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/40">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Friends</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your friends list.</p>
        </div>
      </div>

      <form action={handleBind} className="flex gap-4">
        <input 
          type="text" 
          name="splitId"
          placeholder="Add by Split ID (e.g. SPT-XXXXXX)" 
          className="flex-1 h-11 px-4 rounded-xl glass-panel focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all"
          required
        />
        <button 
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Friend"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading friends...</div>
        ) : friendsList && friendsList.length > 0 ? (
          friendsList.map((f) => {
            const balance = 0.00;
            return (
              <div key={f.friend_id} className="glass-panel p-4 rounded-premium flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {f.profile?.name?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <p className="font-semibold">{f.profile?.name || "Unknown User"}</p>
                    <p className="text-xs text-slate-500 font-mono">{f.profile?.split_id}</p>
                  </div>
                </div>
                <span className={`font-mono font-bold ${balance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {balance >= 0 ? '+' : '-'}₹{Math.abs(balance).toFixed(2)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center text-slate-500 glass-panel rounded-premium text-sm">
            No friends found. Add a Split ID to connect with someone.
          </div>
        )}
      </div>
    </div>
  );
}
