"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/db/schema";
import { deleteAccount, clearAllTransactions } from "@/src/db/operations";
import { toast } from "sonner";
import { AlertOctagon, Trash2, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const accounts = useLiveQuery(() => db.accounts.orderBy('createdAt').reverse().toArray());

  // Local state for inline confirmation safety checks
  const [accountToDelete, setAccountToDelete] = useState("");
  const [isConfirmingAccount, setIsConfirmingAccount] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    setIsProcessing(true);
    try {
      await deleteAccount(accountToDelete);
      toast.success("Account and its transactions permanently deleted.");
      setAccountToDelete("");
      setIsConfirmingAccount(false);
    } catch (error) {
      toast.error("Failed to delete account.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearTransactions = async () => {
    setIsProcessing(true);
    try {
      await clearAllTransactions();
      toast.success("All transactions cleared. Balances reset to initial amounts.");
      setIsConfirmingClear(false);
    } catch (error) {
      toast.error("Failed to clear transactions.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage app data and preferences.</p>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-8">
        <div className="flex items-center gap-3 text-red-500 mb-6">
          <AlertOctagon className="w-6 h-6" />
          <h2 className="text-xl font-bold">Danger Zone</h2>
        </div>
        
        <p className="text-sm text-red-500/80 font-medium bg-red-500/10 p-3 rounded-md">
          WARNING: Actions taken here are permanent. There is no cloud backup to restore from. Once data is deleted, it is gone forever.
        </p>

        {/* --- CLEAR TRANSACTIONS SECTION --- */}
        <div className="space-y-4 border-t border-red-500/20 pt-6">
          <div>
            <h3 className="font-semibold text-foreground">Clear All Transactions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This will wipe the transaction ledger entirely. Your accounts will not be deleted, but their balances will be reset to their original starting amounts.
            </p>
          </div>
          
          {!isConfirmingClear ? (
            <button 
              onClick={() => setIsConfirmingClear(true)}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset Ledger
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-md border border-red-500/30">
              <span className="text-sm font-bold text-red-500">Are you absolutely sure?</span>
              <button 
                onClick={handleClearTransactions}
                disabled={isProcessing}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? "Wiping..." : "Yes, Wipe Everything"}
              </button>
              <button 
                onClick={() => setIsConfirmingClear(false)}
                className="bg-background border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* --- DELETE ACCOUNT SECTION --- */}
        <div className="space-y-4 border-t border-red-500/20 pt-6">
          <div>
            <h3 className="font-semibold text-foreground">Delete Account</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select an account to permanently destroy. Any transactions linked exclusively to this account will also be deleted to prevent orphaned data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={accountToDelete}
              onChange={(e) => {
                setAccountToDelete(e.target.value);
                setIsConfirmingAccount(false);
              }}
              className="flex-1 px-3 py-2 border border-red-500/30 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="" disabled>Select account to delete</option>
              {accounts?.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>

            {!isConfirmingAccount ? (
              <button 
                onClick={() => setIsConfirmingAccount(true)}
                disabled={!accountToDelete}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setIsConfirmingAccount(false)}
                  className="bg-background border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}