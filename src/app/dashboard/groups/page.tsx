import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GroupsClientWrapper } from "@/components/GroupsClientWrapper";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: groups } = await supabase
    .from("groups")
    .select(`
      *,
      group_members(user_id)
    `);

  return <GroupsClientWrapper groups={groups || []} />;
}
