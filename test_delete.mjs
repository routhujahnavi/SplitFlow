import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wddhesdyzxhdxdgxoqkz.supabase.co';
const supabaseKey = 'sb_publishable_9J3H5CbALgoDn-O1W1Ekzg_1KTYwc8N';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'testuserb@splitflow.io',
    password: 'password123',
  });
  
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("title", "NON_EXISTENT_EXPENSE");

  console.log("Delete error:", error);
}

run();
