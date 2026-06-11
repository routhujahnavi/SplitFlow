import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GroupDetailsClient } from "@/components/GroupDetailsClient";

export default async function GroupDetailsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = await params;
  const groupId = resolvedParams.groupId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Fetch the group and its members
  const { data: group } = await supabase
    .from("groups")
    .select(`
      *,
      group_members(user_id, profiles(id, name, email))
    `)
    .eq("id", groupId)
    .single();

  if (!group) redirect("/dashboard/groups");

  // Fetch all expenses for this group
  const { data: expenses } = await supabase
    .from("expenses")
    .select(`
      *,
      profiles!expenses_paid_by_fkey(name)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  // Fetch user's friends to populate the "Add Member" dropdown
  const { data: friendsData } = await supabase
    .from("friends")
    .select(`
      friend_id,
      profiles!friends_friend_id_fkey(id, name, email)
    `)
    .eq("user_id", user.id);

  // Also fetch friends where the user is the friend_id
  const { data: friendsData2 } = await supabase
    .from("friends")
    .select(`
      user_id,
      profiles!friends_user_id_fkey(id, name, email)
    `)
    .eq("friend_id", user.id);

  const friends = [
    ...(friendsData?.map(f => f.profiles) || []),
    ...(friendsData2?.map(f => f.profiles) || [])
  ].filter(Boolean);

  // Fetch current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <GroupDetailsClient group={group} expenses={expenses || []} friends={friends} profile={profile} />;
}
