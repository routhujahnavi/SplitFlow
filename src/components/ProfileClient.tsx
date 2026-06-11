"use client";

import { useState } from "react";
import { ProfileQRCode } from "@/components/ProfileQRCode";
import { updateProfile } from "@/app/actions";
import { Edit2, Save, X } from "lucide-react";

export function ProfileClient({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append("name", name.trim());
    
    await updateProfile(formData);
    
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel p-8 rounded-premium text-center space-y-4 max-w-lg mx-auto mt-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
      
      <div className="absolute top-6 right-6">
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-xl transition-colors"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => {
              setIsEditing(false);
              setName(profile?.name || ""); // Reset
            }}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-xl shadow-purple-500/20 ring-4 ring-slate-900 mt-2">
        {name?.substring(0, 2).toUpperCase() || "??"}
      </div>
      
      <div className="pt-2 min-h-[80px] flex flex-col justify-center">
        {!isEditing ? (
          <>
            <h3 className="text-3xl font-bold text-slate-100">{profile?.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{profile?.email}</p>
          </>
        ) : (
          <div className="space-y-3 max-w-xs mx-auto w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-center font-bold text-lg text-white"
              placeholder="Your Name"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
      
      <div className="inline-flex flex-col items-center gap-2 mt-4 pt-6 border-t border-slate-800/50 w-full">
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Unique Split ID</span>
        <div className="px-6 py-3 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
          <span className="font-mono text-lg font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
            {profile?.split_id}
          </span>
        </div>

        <div className="mt-6 mb-2">
          <ProfileQRCode value={profile?.split_id || ""} />
        </div>

        <p className="text-[10px] text-slate-500 max-w-xs mt-2">
          Share this ID or scan the QR Code with your friends to connect and start splitting expenses.
        </p>
      </div>
    </div>
  );
}
