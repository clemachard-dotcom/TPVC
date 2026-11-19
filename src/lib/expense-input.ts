import { isMember, type Member } from './group';
import { formatEuros, MAX_AMOUNT_CENTS, parseAmountToCents } from './money';

export const LABEL_MAX_LENGTH = 80;

export type ExpenseFields = { label: string; amount: string; paidBy: string };

export type ExpenseFormState = {
  status: 'idle' | 'error' | 'success';
  message: string;
  fieldErrors: Partial<Record<keyof ExpenseFields, string>>;
  // Valeurs à réafficher dans le formulaire (conservées en cas d’erreur).
  values: ExpenseFields;
};

export const emptyExpenseFields: ExpenseFields = { label: '', amount: '', paidBy: '' };

export const initialExpenseFormState: ExpenseFormState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
  values: emptyExpenseFields,
};

export type ValidExpense = { label: string; amountCents: number; paidBy: Member };

export type ExpenseValidation =
  | { ok: true; expense: ValidExpense }
  | { ok: false; fieldErrors: ExpenseFormState['fieldErrors'] };

const amountMessages = {
  empty: 'Indique le prix.',
  invalid: 'Écris un prix positif avec deux décimales au plus, par exemple 30 ou 12,50.',
  zero: 'Le prix doit être supérieur à 0 €.',
  'too-large': `Le prix ne peut pas dépasser ${formatEuros(MAX_AMOUNT_CENTS)}.`,
} as const;

export function validateExpense(fields: ExpenseFields): ExpenseValidation {
  const fieldErrors: ExpenseFormState['fieldErrors'] = {};

  const label = fields.label.trim().replace(/\s+/g, ' ');
  if (label === '') {
    fieldErrors.label = 'Indique ce que vous avez acheté.';
  } else if (label.length > LABEL_MAX_LENGTH) {
    fieldErrors.label = `Garde une description de ${LABEL_MAX_LENGTH} caractères au plus.`;
  }

  const amount = parseAmountToCents(fields.amount);
  if (!amount.ok) fieldErrors.amount = amountMessages[amount.reason];

  if (!isMember(fields.paidBy)) fieldErrors.paidBy = 'Choisis qui a payé.';

  if (Object.keys(fieldErrors).length > 0 || !amount.ok || !isMember(fields.paidBy)) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, expense: { label, amountCents: amount.cents, paidBy: fields.paidBy } };
}
