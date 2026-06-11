"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function bindFriend(formData: FormData) {
  const splitId = formData.get("splitId")?.toString();
  if (!splitId) return { error: "Split ID is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Find user by split_id
  const { data: friendProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("split_id", splitId)
    .single();

  if (!friendProfile) return { error: "Split ID not found" };
  if (friendProfile.id === user.id) return { error: "Cannot bind to yourself" };

  // Insert friend relationship (one-way is sufficient due to RLS select policy)
  const { error } = await supabase
    .from("friends")
    .insert([
      { user_id: user.id, friend_id: friendProfile.id, status: "bound" }
    ]);

  if (error && error.code !== "23505") { // Ignore unique violation if already friends
    console.error("Bind connection error:", error);
    return { error: `Failed to bind connection: ${error.message || JSON.stringify(error)}` };
  }

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function createGroup(formData: FormData) {
  const name = formData.get("name")?.toString();
  if (!name) return { error: "Group name is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Create Group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert([{ name, created_by: user.id }])
    .select()
    .single();

  if (groupError || !group) {
    console.error("Group creation error:", groupError);
    return { error: `Failed to create group: ${groupError?.message || 'Unknown error'}` };
  }

  // Add creator to group_members
  const { error: memberError } = await supabase
    .from("group_members")
    .insert([{ group_id: group.id, user_id: user.id }]);
    
  if (memberError) {
    console.error("Group member error:", memberError);
    return { error: `Failed to add group member: ${memberError.message}` };
  }

  revalidatePath("/dashboard/groups");
  return { success: true, groupId: group.id };
}

export async function addExpense(formData: FormData) {
  const title = formData.get("title")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const groupId = formData.get("groupId")?.toString();
  const paidBy = formData.get("paidBy")?.toString();
  
  // We expect participants as a comma-separated string of user IDs
  const participantsRaw = formData.get("participants")?.toString();
  
  if (!title || !amount || !groupId || !paidBy || !participantsRaw) {
    return { error: "All fields are required" };
  }

  const participants = participantsRaw.split(",");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Insert Expense
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert([{ 
      group_id: groupId, 
      title, 
      amount, 
      paid_by: paidBy 
    }])
    .select()
    .single();

  if (expenseError || !expense) return { error: "Failed to commit protocol" };

  // Calculate equal split
  const splitAmount = amount / participants.length;

  // Insert Expense Splits
  const splitsToInsert = participants.map(participantId => ({
    expense_id: expense.id,
    user_id: participantId,
    amount: splitAmount,
    percentage: (100 / participants.length).toFixed(2)
  }));

  const { error: splitsError } = await supabase
    .from("expense_splits")
    .insert(splitsToInsert);

  if (splitsError) return { error: "Failed to distribute balance" };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath(`/dashboard/groups/${groupId}`);
  return { success: true };
}

export async function addGroupMember(formData: FormData) {
  const groupId = formData.get("groupId")?.toString();
  const friendId = formData.get("friendId")?.toString();

  if (!groupId || !friendId) return { error: "Group ID and Friend ID are required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("group_members")
    .insert([{ group_id: groupId, user_id: friendId }]);

  if (error) {
    if (error.code === "23505") return { error: "Friend is already a member of this group" };
    return { error: `Failed to add member: ${error.message}` };
  }

  revalidatePath(`/dashboard/groups/${groupId}`);
  return { success: true };
}

export async function deleteGroup(groupId: string) {
  if (!groupId) return { error: "Group ID is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Note: Ensure the RLS policy for DELETE on groups allows the created_by user to delete it
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (error) {
    return { error: `Failed to delete group: ${error.message}` };
  }

  revalidatePath("/dashboard/groups");
  return { success: true };
}

export async function deleteExpense(expenseId: string, groupId?: string) {
  if (!expenseId) return { error: "Expense ID is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Note: Ensure the RLS policy for DELETE on expenses allows group members or creators to delete it
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    return { error: `Failed to delete expense: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  if (groupId) {
    revalidatePath(`/dashboard/groups/${groupId}`);
  }
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const name = formData.get("name")?.toString();

  if (!name) return { error: "Name is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", user.id);

  if (error) {
    return { error: `Failed to update profile: ${error.message}` };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard"); // Revalidate dashboard to update "Welcome back, {name}"
  return { success: true };
}

