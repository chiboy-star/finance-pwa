"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/db/schema";
import { Plus, Wallet, ArrowRight } from "lucide-react";

export default function Dashboard() {
  // Real-time query to fetch all accounts from the local Dexie database
  const accounts = useLiveQuery(() => db.accounts.toArray());

  // Calculate the master balance dynamically based on fetched accounts
  const totalBalance =
    accounts?.reduce((sum, account) => sum + account.currentBalance, 0) || 0;

  // Formatter for clean currency display
 const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Welcome back to your ledger.</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </Link>
      </div>

      {/* Master Balance Card */}
      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Total Available Funds
        </h2>
        <p className="text-5xl font-extrabold text-foreground tracking-tighter">
          {formatMoney(totalBalance)}
        </p>
      </div>

      {/* Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Accounts</h2>
          <Link
            href="/accounts"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {accounts === undefined ? (
          <p className="text-muted-foreground text-sm animate-pulse">
            Loading accounts...
          </p>
        ) : accounts.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20">
            <Wallet className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium">No accounts yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first account to start tracking your money.
            </p>
            <Link
              href="/accounts"
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Create Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/transactions?accountId=${account.id}`}
                className="group block p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium truncate">{account.name}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {formatMoney(account.currentBalance)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}