import Dexie, { type Table } from 'dexie';

export interface Account {
  id?: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
}

export interface Transaction {
  id?: string;
  accountId: string;
  type: 'inflow' | 'outflow';
  amount: number;
  reason: string;
  timestamp: Date;
}

class OfflineFinanceDB extends Dexie {
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;

  constructor() {
    super('OfflineFinanceDB');
    
    // BUMPED TO VERSION 2: Removed source and destination
    this.version(2).stores({
      accounts: 'id, name, createdAt',
      transactions: 'id, accountId, type, reason, timestamp',
    });
  }
}

export const db = new OfflineFinanceDB();