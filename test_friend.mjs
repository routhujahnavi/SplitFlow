import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wddhesdyzxhdxdgxoqkz.supabase.co';
const supabaseKey = 'sb_publishable_9J3H5CbALgoDn-O1W1Ekzg_1KTYwc8N';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testuserb@splitflow.io',
    password: 'password123',
  });
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  
  const user = authData.user;
  console.log("Logged in as:", user.id);

  // SPT-45EF3E is Test User A's split_id
  const { data: friendProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("split_id", "SPT-45EF3E")
    .single();
    
  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return;
  }
  
  console.log("Found friend:", friendProfile.id);

  const { error: insertError } = await supabase
    .from("friends")
    .insert([
      { user_id: user.id, friend_id: friendProfile.id, status: "bound" },
      { user_id: friendProfile.id, friend_id: user.id, status: "bound" }
    ]);
    
  if (insertError) {
    console.error("Insert error:", insertError);
  } else {
    console.log("Success!");
  }
}

run();
