import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
};


export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Fetch all expenses where user is a participant
  const { data: expenses } = await supabase
    .from("expenses")
    .select(`
      *,
      expense_splits!inner(user_id)
    `)
    .eq("expense_splits.user_id", user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/40">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recent History</h2>
          <p className="text-sm text-slate-400 mt-1">View your past expenses.</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl">
        <input 
          type="text" 
          placeholder="Filter descriptions..." 
          className="w-full h-11 px-4 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>

      <div className="relative pl-6 border-l-2 border-slate-800/40 space-y-8 mt-8">
        {expenses && expenses.length > 0 ? (
          expenses.map((exp) => (
            <div key={exp.id} className="relative">
              <div className="absolute -left-[31px] top-2 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-slate-900"></div>
              <div className="glass-panel p-4 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-purple-400 font-mono">
                  {formatDate(exp.created_at)}
                </span>
                <p className="font-semibold text-slate-200">{exp.title}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-mono text-slate-400">Total: ₹{Number(exp.amount).toFixed(2)}</p>
                  <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] uppercase">{exp.category}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-sm py-4">No historical transactions recorded in the ledger yet.</div>
        )}
      </div>
    </div>
  );
}
