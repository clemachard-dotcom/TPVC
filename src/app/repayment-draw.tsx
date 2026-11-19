'use client';

import { useRef, useState, useTransition } from 'react';
import { confirmRepaymentAction, drawRepaymentAction } from './actions';
import type { RepaymentProposal } from '@/lib/balances';
import { formatEuros } from '@/lib/money';
import { CONFLICT_MESSAGE, SETTLED_MESSAGE } from '@/lib/repayment-state';

type Notice = { tone: 'neutral' | 'success' | 'error'; text: string };
type Draft = { proposal: RepaymentProposal; stateKey: string };

const toneClass: Record<Notice['tone'], string> = {
  neutral: 'text-muted',
  success: 'text-positive',
  error: 'text-negative',
};

export function RepaymentDraw() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, startTransition] = useTransition();
  // Évite d’envoyer deux fois la même action sur un double clic.
  const busy = useRef(false);

  function run(task: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      try {
        await task();
      } finally {
        busy.current = false;
      }
    });
  }

  function draw() {
    run(async () => {
      const result = await drawRepaymentAction();
      if (result.status === 'proposal') {
        setDraft({ proposal: result.proposal, stateKey: result.stateKey });
        setNotice(null);
      } else {
        setDraft(null);
        setNotice(
          result.status === 'settled'
            ? { tone: 'neutral', text: SETTLED_MESSAGE }
            : { tone: 'error', text: 'Impossible de lire les soldes pour le moment. Réessaie dans un instant.' },
        );
      }
    });
  }

  function confirm(current: Draft) {
    run(async () => {
      const result = await confirmRepaymentAction(current.proposal, current.stateKey);
      if (result.status === 'confirmed') {
        const { from, to, amountCents } = result.proposal;
        setDraft(null);
        setNotice({ tone: 'success', text: `Remboursement enregistré : ${from} a remboursé ${formatEuros(amountCents)} à ${to}.` });
      } else if (result.status === 'conflict') {
        setDraft(null);
        setNotice({ tone: 'error', text: CONFLICT_MESSAGE });
      } else {
        setNotice({ tone: 'error', text: 'Le remboursement n’a pas pu être enregistré. Réessaie dans un instant.' });
      }
    });
  }

  function cancel() {
    setDraft(null);
    setNotice({ tone: 'neutral', text: 'Tirage annulé. Les soldes n’ont pas changé.' });
  }

  return (
    <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={draw}
          disabled={pending}
          className="rounded-lg border border-accent px-5 py-2.5 font-semibold text-accent disabled:opacity-60"
        >
          Qui rembourse ?
        </button>
        <p className="text-sm text-muted">Tire au sort une personne qui doit encore de l’argent.</p>
      </div>

      <div aria-live="polite">
        {draft && (
          <div className="mt-4 border-s-4 border-accent ps-4">
            <p className="text-lg">
              <strong>{draft.proposal.from}</strong> peut rembourser{' '}
              <strong>{formatEuros(draft.proposal.amountCents)}</strong> à <strong>{draft.proposal.to}</strong>.
            </p>
            <p className="mt-1 text-sm text-muted">Les soldes changeront seulement si tu confirmes.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => confirm(draft)}
                disabled={pending}
                className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {pending ? 'Enregistrement…' : 'Confirmer'}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={pending}
                className="rounded-lg border border-muted/40 px-5 py-2.5 font-semibold disabled:opacity-60"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        {notice && <p className={`mt-4 ${toneClass[notice.tone]}`}>{notice.text}</p>}
      </div>
    </div>
  );
}
