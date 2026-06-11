import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wddhesdyzxhdxdgxoqkz.supabase.co';
const supabaseKey = 'sb_publishable_9J3H5CbALgoDn-O1W1Ekzg_1KTYwc8N';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'testuserb@splitflow.io',
    password: 'password123',
  });
  
  // First get the group ID for "TRIP TO TIRUPATI"
  const { data: group } = await supabase.from("groups").select("id").limit(1).single();
  console.log("Group ID:", group.id);

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select(`
      *,
      profiles(name)
    `)
    .eq("group_id", group.id)
    .order("created_at", { ascending: false });

  console.log("Expenses data:", expenses);
  console.log("Expenses error:", error);
}

run();
