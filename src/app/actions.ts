'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { loadLedger } from '@/db/ledger';
import { expenses, repayments } from '@/db/schema';
import { computeBalances, drawRepayment, proposalFor, type RepaymentProposal } from '@/lib/balances';
import { isMember } from '@/lib/group';
import { ledgerKey } from '@/lib/ledger-key';
import type { ConfirmResult, DrawResult } from '@/lib/repayment-state';
import {
  emptyExpenseFields,
  validateExpense,
  type ExpenseFields,
  type ExpenseFormState,
} from '@/lib/expense-input';
import { formatEuros } from '@/lib/money';

function readField(formData: FormData, name: keyof ExpenseFields): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function addExpense(
  _previous: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const values: ExpenseFields = {
    label: readField(formData, 'label'),
    amount: readField(formData, 'amount'),
    paidBy: readField(formData, 'paidBy'),
  };

  const validation = validateExpense(values);
  if (!validation.ok) {
    return {
      status: 'error',
      message: 'La dépense n’a pas été enregistrée. Corrige le champ indiqué puis réessaie.',
      fieldErrors: validation.fieldErrors,
      values,
    };
  }

  const { label, amountCents, paidBy } = validation.expense;

  try {
    await getDb().insert(expenses).values({ label, amountCents, paidBy });
  } catch (error) {
    console.error('Enregistrement de la dépense impossible', error);
    return {
      status: 'error',
      message: 'La dépense n’a pas pu être enregistrée dans la base. Ta saisie est conservée : réessaie dans un instant.',
      fieldErrors: {},
      values,
    };
  }

  revalidatePath('/');

  return {
    status: 'success',
    message: `Dépense ajoutée : ${label}, ${formatEuros(amountCents)}, payée par ${paidBy}.`,
    fieldErrors: {},
    values: emptyExpenseFields,
  };
}

// Tire au sort une personne qui doit encore de l’argent, d’après l’état actuel de la base.
// Rien n’est enregistré : la proposition garde l’empreinte de l’état sur lequel elle repose.
export async function drawRepaymentAction(): Promise<DrawResult> {
  try {
    const ledger = await loadLedger();
    const proposal = drawRepayment(computeBalances(ledger.expenses, ledger.repayments));
    if (proposal === null) return { status: 'settled' };
    return { status: 'proposal', proposal, stateKey: ledgerKey(ledger.expenses, ledger.repayments) };
  } catch (error) {
    console.error('Tirage du remboursement impossible', error);
    return { status: 'error' };
  }
}

function isUniqueViolation(error: unknown): boolean {
  for (let current: unknown = error; current instanceof Error; current = current.cause) {
    if ((current as { code?: unknown }).code === '23505') return true;
  }
  return false;
}

// Enregistre le remboursement proposé seulement si les comptes n’ont pas bougé depuis le tirage
// et si la proposition correspond toujours au calcul. Un même tirage ne peut être enregistré
// qu’une fois grâce à la contrainte d’unicité sur `state_key`.
export async function confirmRepaymentAction(
  proposal: RepaymentProposal,
  stateKey: string,
): Promise<ConfirmResult> {
  if (
    !isMember(proposal?.from) ||
    !isMember(proposal?.to) ||
    !Number.isSafeInteger(proposal?.amountCents) ||
    typeof stateKey !== 'string'
  ) {
    return { status: 'conflict' };
  }

  try {
    const ledger = await loadLedger();
    if (ledgerKey(ledger.expenses, ledger.repayments) !== stateKey) return { status: 'conflict' };

    const expected = proposalFor(computeBalances(ledger.expenses, ledger.repayments), proposal.from);
    if (!expected || expected.to !== proposal.to || expected.amountCents !== proposal.amountCents) {
      return { status: 'conflict' };
    }

    await getDb().insert(repayments).values({
      fromMember: expected.from,
      toMember: expected.to,
      amountCents: expected.amountCents,
      stateKey,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { status: 'conflict' };
    console.error('Enregistrement du remboursement impossible', error);
    return { status: 'error' };
  }

  revalidatePath('/');
  return { status: 'confirmed', proposal };
}
