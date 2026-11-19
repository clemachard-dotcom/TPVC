import 'server-only';
import { desc } from 'drizzle-orm';
import { getDb } from '.';
import { expenses, repayments, type Expense, type Repayment } from './schema';

export type Ledger = { expenses: Expense[]; repayments: Repayment[] };

// Lit toutes les écritures du groupe, les plus récentes d’abord.
export async function loadLedger(): Promise<Ledger> {
  const db = getDb();
  const [expenseRows, repaymentRows] = await Promise.all([
    db.select().from(expenses).orderBy(desc(expenses.createdAt), desc(expenses.id)),
    db.select().from(repayments).orderBy(desc(repayments.createdAt), desc(repayments.id)),
  ]);
  return { expenses: expenseRows, repayments: repaymentRows };
}
