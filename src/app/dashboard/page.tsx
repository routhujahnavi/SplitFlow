import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, group_members(user_id)");

  const { data: expenses } = await supabase
    .from("expenses")
    .select(`*, expense_splits!inner(user_id)`)
    .eq("expense_splits.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return <DashboardClient profile={profile} groups={groups || []} expenses={expenses || []} />;
}
