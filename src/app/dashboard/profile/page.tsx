import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/40">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your account details.</p>
        </div>
      </div>

      <ProfileClient profile={profile} />
    </div>
  );
}
