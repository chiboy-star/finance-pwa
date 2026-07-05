import { db, type Account, type Transaction } from './schema';
import { v4 as uuidv4 } from 'uuid';

// ==============================
// ACCOUNT OPERATIONS
// ==============================

export async function createAccount(name: string, initialBalance: number) {
  const newAccount: Account = {
    id: uuidv4(),
    name,
    initialBalance,
    currentBalance: initialBalance,
    createdAt: new Date(),
  };
  
  await db.accounts.add(newAccount);
  return newAccount;
}

export async function getAllAccounts() {
  // Returns accounts sorted by newest first
  return await db.accounts.orderBy('createdAt').reverse().toArray();
}

export async function getTotalBalance() {
  const accounts = await db.accounts.toArray();
  return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
}

// ==============================
// TRANSACTION OPERATIONS
// ==============================

export async function addTransaction(
  data: Omit<Transaction, 'id' | 'timestamp'>
) {
  // We use a Dexie transaction block to ensure both the transaction is logged 
  // AND the account balance is updated at the same time. If one fails, both fail.
  return await db.transaction('rw', db.transactions, db.accounts, async () => {
    const account = await db.accounts.get(data.accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }

    const newTransaction: Transaction = {
      ...data,
      id: uuidv4(),
      timestamp: new Date(),
    };

    // Calculate the new balance
    const amountChange = data.type === 'inflow' ? data.amount : -data.amount;
    const newBalance = account.currentBalance + amountChange;

    // Update the parent account's current balance
    await db.accounts.update(data.accountId, {
      currentBalance: newBalance,
    });

    // Save the transaction record
    await db.transactions.add(newTransaction);
    
    return newTransaction;
  });
}

export async function getAllTransactions() {
  return await db.transactions.orderBy('timestamp').reverse().toArray();
}

export async function getTransactionsByAccount(accountId: string) {
  return await db.transactions
    .where('accountId')
    .equals(accountId)
    .reverse()
    .sortBy('timestamp');
}

// ==============================
// DANGER ZONE OPERATIONS
// ==============================

export async function deleteAccount(accountId: string) {
  // Deletes the account AND wipes all transactions associated with it
  return await db.transaction('rw', db.transactions, db.accounts, async () => {
    await db.transactions.where('accountId').equals(accountId).delete();
    await db.accounts.delete(accountId);
  });
}

export async function clearAllTransactions() {
  // Wipes the transaction ledger and resets all accounts to their initial balances
  return await db.transaction('rw', db.transactions, db.accounts, async () => {
    await db.transactions.clear();
    
    const allAccounts = await db.accounts.toArray();
    for (const account of allAccounts) {
      await db.accounts.update(account.id!, { 
        currentBalance: account.initialBalance 
      });
    }
  });
}