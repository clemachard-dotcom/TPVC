import { connection } from 'next/server';
import { loadLedger, type Ledger } from '@/db/ledger';
import type { Expense, Repayment } from '@/db/schema';
import { computeBalances } from '@/lib/balances';
import { MEMBERS } from '@/lib/group';
import { formatEuros } from '@/lib/money';
import { ExpenseForm } from './expense-form';
import { RepaymentDraw } from './repayment-draw';

async function readLedger(): Promise<Ledger | null> {
  try {
    return await loadLedger();
  } catch (error) {
    console.error('Lecture des dépenses impossible', error);
    return null;
  }
}

export default async function Home() {
  await connection();
  const ledger = await readLedger();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <header className="border-s-4 border-accent ps-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Dépenses entre amis</h1>
        <p className="mt-3 text-lg text-muted">
          {MEMBERS.join(', ').replace(/, ([^,]*)$/, ' et $1')} partagent chaque dépense à parts égales.
        </p>
      </header>

      {ledger === null ? (
        <p role="alert" className="mt-10 rounded-lg border border-negative/40 bg-white p-5 text-negative">
          Impossible de lire les dépenses dans la base pour le moment. Vérifie la connexion à Neon puis
          actualise la page.
        </p>
      ) : (
        <>
          <Balances expenses={ledger.expenses} repayments={ledger.repayments} />

          <section aria-labelledby="add-title" className="mt-10 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 id="add-title" className="text-xl font-semibold">
              Ajouter une dépense
            </h2>
            <div className="mt-5">
              <ExpenseForm />
            </div>
          </section>

          <ExpenseList rows={ledger.expenses} />
          <RepaymentList rows={ledger.repayments} />
        </>
      )}
    </main>
  );
}

function Balances({ expenses, repayments }: { expenses: Expense[]; repayments: Repayment[] }) {
  const balances = computeBalances(expenses, repayments);

  return (
    <section aria-labelledby="balances-title" className="mt-10">
      <h2 id="balances-title" className="text-xl font-semibold">
        Qui doit quoi
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {balances.map(({ member, cents }) => (
          <li key={member} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-lg font-semibold">{member}</p>
            {cents > 0 && (
              <p className="mt-1 text-positive">
                récupère <strong className="text-2xl">{formatEuros(cents)}</strong>
              </p>
            )}
            {cents < 0 && (
              <p className="mt-1 text-negative">
                doit <strong className="text-2xl">{formatEuros(-cents)}</strong>
              </p>
            )}
            {cents === 0 && <p className="mt-1 text-muted">est quitte</p>}
          </li>
        ))}
      </ul>
      <RepaymentDraw />
    </section>
  );
}

function ExpenseList({ rows }: { rows: Expense[] }) {
  const total = rows.reduce((sum, row) => sum + row.amountCents, 0);

  return (
    <section aria-labelledby="list-title" className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="list-title" className="text-xl font-semibold">
          Dépenses
        </h2>
        {rows.length > 0 && <p className="text-muted">Total : {formatEuros(total)}</p>}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-muted">Aucune dépense pour l’instant. Ajoute la première ci-dessus.</p>
      ) : (
        <ul className="mt-4 divide-y divide-muted/20 rounded-xl bg-white shadow-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
              <span className="font-medium">{row.label}</span>
              <span className="text-muted">
                <strong className="text-ink">{formatEuros(row.amountCents)}</strong> · payé par {row.paidBy}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RepaymentList({ rows }: { rows: Repayment[] }) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="repayments-title" className="mt-10">
      <h2 id="repayments-title" className="text-xl font-semibold">
        Remboursements
      </h2>
      <ul className="mt-4 divide-y divide-muted/20 rounded-xl bg-white shadow-sm">
        {rows.map((row) => (
          <li key={row.id} className="px-5 py-4">
            <span className="font-medium">{row.fromMember}</span> a remboursé{' '}
            <strong>{formatEuros(row.amountCents)}</strong> à <span className="font-medium">{row.toMember}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
