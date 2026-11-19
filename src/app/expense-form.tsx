'use client';

import { useActionState } from 'react';
import { addExpense } from './actions';
import { MEMBERS } from '@/lib/group';
import { initialExpenseFormState, LABEL_MAX_LENGTH } from '@/lib/expense-input';

const fieldClass =
  'mt-2 block w-full rounded-lg border border-muted/40 bg-white px-3 py-2.5 text-base text-ink shadow-sm aria-invalid:border-negative';

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(addExpense, initialExpenseFormState);
  const { fieldErrors, values } = state;

  return (
    <form action={formAction} className="space-y-5" aria-describedby="expense-form-status">
      <div>
        <label htmlFor="label" className="font-medium">
          Ce qu’on a acheté
        </label>
        <input
          id="label"
          name="label"
          type="text"
          autoComplete="off"
          placeholder="Courses, pizzas, essence…"
          maxLength={LABEL_MAX_LENGTH + 20}
          defaultValue={values.label}
          aria-required="true"
          aria-invalid={fieldErrors.label ? true : undefined}
          aria-describedby={fieldErrors.label ? 'label-error' : undefined}
          className={fieldClass}
        />
        {fieldErrors.label && (
          <p id="label-error" className="mt-1.5 text-sm text-negative">
            {fieldErrors.label}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="font-medium">
          Prix (€)
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="30 ou 12,50"
          defaultValue={values.amount}
          aria-required="true"
          aria-invalid={fieldErrors.amount ? true : undefined}
          aria-describedby={fieldErrors.amount ? 'amount-error' : undefined}
          className={`${fieldClass} max-w-48`}
        />
        {fieldErrors.amount && (
          <p id="amount-error" className="mt-1.5 text-sm text-negative">
            {fieldErrors.amount}
          </p>
        )}
      </div>

      <fieldset aria-describedby={fieldErrors.paidBy ? 'paidBy-error' : undefined}>
        <legend className="font-medium">Qui a payé ?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEMBERS.map((member) => (
            <label
              key={member}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-muted/40 bg-white px-4 py-2.5 has-checked:border-accent has-checked:bg-accent/10 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="paidBy"
                value={member}
                defaultChecked={values.paidBy === member}
                className="size-4 accent-accent focus-visible:outline-none"
              />
              {member}
            </label>
          ))}
        </div>
        {fieldErrors.paidBy && (
          <p id="paidBy-error" className="mt-1.5 text-sm text-negative">
            {fieldErrors.paidBy}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {pending ? 'Enregistrement…' : 'Ajouter la dépense'}
        </button>
        <p
          id="expense-form-status"
          aria-live="polite"
          className={state.status === 'error' ? 'text-sm text-negative' : 'text-sm text-positive'}
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
