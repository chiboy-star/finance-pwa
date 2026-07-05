"use client";

import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/db/schema";
import { addTransaction } from "@/src/db/operations";
import { ArrowDownCircle, ArrowUpCircle, List, PieChart as PieChartIcon, Search, ArrowRightLeft, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { toast } from "sonner"; // Direct import, bypassing shadcn

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TransactionsPage() {
  const accounts = useLiveQuery(() => db.accounts.orderBy('createdAt').reverse().toArray());
  const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().toArray());

  const [activeTab, setActiveTab] = useState<'ledger' | 'analytics'>('ledger');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [type, setType] = useState<'inflow' | 'outflow'>('outflow');
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [reason, setReason] = useState("");

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId) {
      toast.error("Please select an account.");
      return;
    }
    if (!amount || !reason) {
      toast.error("Please fill out the amount and reason.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    
    if (type === 'outflow') {
      const selectedAccount = accounts?.find(acc => acc.id === accountId);
      if (selectedAccount && parsedAmount > selectedAccount.currentBalance) {
        toast.error(`Insufficient funds. You only have ${formatMoney(selectedAccount.currentBalance)} available in this account.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        accountId,
        type,
        amount: parsedAmount,
        reason,
      });
      toast.success("Transaction logged successfully!");
      setAmount("");
      setReason("");
    } catch (error) {
      toast.error("Failed to save transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const expensesByReason = useMemo(() => {
    if (!transactions) return [];
    const outflows = transactions.filter(t => t.type === 'outflow');
    const grouped = outflows.reduce((acc, curr) => {
      acc[curr.reason] = (acc[curr.reason] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Log and analyze your money flow.</p>
        </div>
        
        <div className="flex p-1 bg-muted rounded-lg w-fit border">
          <button onClick={() => setActiveTab('ledger')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ledger' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><List className="w-4 h-4" /> Ledger</button>
          <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><PieChartIcon className="w-4 h-4" /> Analytics</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAddTransaction} className="bg-card border rounded-xl p-5 shadow-sm space-y-5 sticky top-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" /> New Log
            </h2>

            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
              <button type="button" onClick={() => setType('outflow')} className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 text-sm font-medium transition-all duration-200 ${type === 'outflow' ? 'bg-red-500/10 text-red-600 shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}><ArrowUpCircle className="w-4 h-4" /> Outflow</button>
              <button type="button" onClick={() => setType('inflow')} className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 text-sm font-medium transition-all duration-200 ${type === 'inflow' ? 'bg-green-500/10 text-green-600 shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}><ArrowDownCircle className="w-4 h-4" /> Inflow</button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₦)</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            {/* Custom Styled Native Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <div className="relative">
                <select
                  required value={accountId} onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10 cursor-pointer"
                >
                  <option value="" disabled>Select an account</option>
                  {accounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({formatMoney(acc.currentBalance)})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason / Category</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={type === 'outflow' ? "e.g., Internet Data" : "e.g., Salary"} className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <button type="submit" disabled={isSubmitting || !accounts?.length} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting ? "Logging..." : accounts?.length ? "Save Transaction" : "Create an account first"}
            </button>
          </form>
        </div>

        {/* Ledger & Analytics View */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'ledger' ? (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              {transactions === undefined ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Loading ledger...</div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No transactions yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {transactions.map((tx) => {
                    const account = accounts?.find(a => a.id === tx.accountId);
                    const isInflow = tx.type === 'inflow';
                    return (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full mt-1 ${isInflow ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                            {isInflow ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold">{tx.reason}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{account?.name || 'Unknown Account'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${isInflow ? 'text-green-600' : 'text-foreground'}`}>
                          {isInflow ? '+' : '-'}{formatMoney(tx.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
             <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-6">Spending Breakdown</h3>
              {expensesByReason.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No outflow data to visualize.</p>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expensesByReason} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {expensesByReason.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatMoney(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}