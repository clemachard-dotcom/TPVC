import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

// Une dépense payée par un membre du groupe, partagée à parts égales.
// Le montant est stocké en centimes pour éviter les erreurs d’arrondi.
export const expenses = pgTable(
  'expenses',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    label: text('label').notNull(),
    amountCents: integer('amount_cents').notNull(),
    paidBy: text('paid_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('expenses_label_not_blank', sql`length(trim(${table.label})) > 0`),
    check('expenses_amount_positive', sql`${table.amountCents} > 0`),
  ],
);

export type Expense = typeof expenses.$inferSelect;

// Un remboursement confirmé : un membre qui devait de l’argent en rend à un autre.
// `stateKey` identifie l’état des comptes sur lequel le tirage s’appuyait :
// il est unique, donc un même tirage ne peut pas être enregistré deux fois.
export const repayments = pgTable(
  'repayments',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    fromMember: text('from_member').notNull(),
    toMember: text('to_member').notNull(),
    amountCents: integer('amount_cents').notNull(),
    stateKey: text('state_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('repayments_state_key_unique').on(table.stateKey),
    check('repayments_amount_positive', sql`${table.amountCents} > 0`),
    check('repayments_distinct_members', sql`${table.fromMember} <> ${table.toMember}`),
  ],
);

export type Repayment = typeof repayments.$inferSelect;
