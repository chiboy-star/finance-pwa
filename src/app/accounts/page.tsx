"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/db/schema";
import { createAccount } from "@/src/db/operations";
import { Wallet, PlusCircle, CheckCircle2 } from "lucide-react";

export default function AccountsPage() {
  // Read existing accounts
  const accounts = useLiveQuery(() => db.accounts.toArray());

  // Form state
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };
  
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !initialBalance) return;

    setIsSubmitting(true);
    try {
      await createAccount(name.trim(), parseFloat(initialBalance));
      // Reset form on success
      setName("");
      setInitialBalance("");
    } catch (error) {
      console.error("Failed to create account", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground">Manage your money buckets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Account Form (Takes up 1 column on desktop) */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleCreateAccount}
            className="bg-card border rounded-xl p-5 shadow-sm space-y-4 sticky top-6"
          >
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-primary" />
                New Account
              </h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Account Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Daily Spending"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium text-foreground">
                Initial Balance ($)
              </label>
              <input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Accounts List (Takes up 2 columns on desktop) */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Active Accounts</h2>
          
          {accounts === undefined ? (
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          ) : accounts.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/10">
              <p className="text-sm text-muted-foreground">
                No accounts created yet. Use the form to add one!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-card border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {account.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500" /> Active
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-2xl font-bold">{formatMoney(account.currentBalance)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}