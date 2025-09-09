export type transaction_type = 'credit' | 'debit';

export interface Transaction {
  id: string; // uuid
  account_id: string;
  type: transaction_type;
  amount: string; // decimal
  description: string;
  created_at: Date;
}
