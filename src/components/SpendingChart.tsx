"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatShortDate = (isoString: string) => {
  const date = new Date(isoString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
};


export function SpendingChart({ expenses, currentUserId }: { expenses: any[], currentUserId: string }) {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    // Filter out expenses paid by you if we only want to chart "spending" (where you owe others or you paid for the group).
    // Let's assume spending means "any expense where you were involved".
    // For a simple visualization, let's group expenses by date and sum the total amount.
    
    // Create a map of date -> amount
    const dateMap = new Map<string, number>();

    // Process from oldest to newest to build a timeline
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    sortedExpenses.forEach(exp => {
      // Calculate how much you spent/owe in this expense.
      // If you paid, it's your spending. If you didn't pay but are splitting, it's also your spending.
      // For simplicity, let's just chart the *Total Group Expense Amount* for the expenses you are involved in.
      const date = formatShortDate(exp.created_at);
      const current = dateMap.get(date) || 0;
      dateMap.set(date, current + Number(exp.amount));
    });

    const data = Array.from(dateMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    if (data.length === 1) {
      // If there's only one point, duplicate it with a slightly earlier date and $0 so Recharts draws an area
      const prevDate = new Date(sortedExpenses[0].created_at);
      prevDate.setDate(prevDate.getDate() - 1);
      data.unshift({
        date: formatShortDate(prevDate.toISOString()),
        amount: 0
      });
    }

    return data;
  }, [expenses]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-sm text-slate-500 italic">
        Not enough data to display spending trends.
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Spent']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#a855f7" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
