import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wddhesdyzxhdxdgxoqkz.supabase.co';
const supabaseKey = 'sb_publishable_9J3H5CbALgoDn-O1W1Ekzg_1KTYwc8N';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'testuserb@splitflow.io',
    password: 'password123',
  });
  
  const user = authData.user;

  const { data: friendProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("split_id", "SPT-5D96E0")
    .single();

  console.log("Inserting row 1...");
  const { error: error1 } = await supabase
    .from("friends")
    .insert([
      { user_id: user.id, friend_id: friendProfile.id, status: "bound" }
    ]);
  console.log("Error 1:", error1);

  console.log("Inserting row 2...");
  const { error: error2 } = await supabase
    .from("friends")
    .insert([
      { user_id: friendProfile.id, friend_id: user.id, status: "bound" }
    ]);
  console.log("Error 2:", error2);
}

run();
