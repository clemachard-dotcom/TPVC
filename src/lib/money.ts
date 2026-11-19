// Montants manipulés en centimes entiers, affichés en euros.

export const MAX_AMOUNT_CENTS = 100_000_00;

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  trailingZeroDisplay: 'stripIfInteger',
});

export function formatEuros(cents: number): string {
  return euros.format(cents / 100);
}

export type ParsedAmount =
  | { ok: true; cents: number }
  | { ok: false; reason: 'empty' | 'invalid' | 'zero' | 'too-large' };

// Accepte « 30 », « 12,50 », « 12.5 » ou « 1 234,56 ». Deux décimales au plus.
export function parseAmountToCents(raw: string): ParsedAmount {
  const compact = raw.replace(/[\s  €]/g, '');

  if (compact === '') return { ok: false, reason: 'empty' };

  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(compact);
  if (!match) return { ok: false, reason: 'invalid' };

  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? '').padEnd(2, '0'));
  const cents = whole * 100 + fraction;

  if (cents === 0) return { ok: false, reason: 'zero' };
  if (cents > MAX_AMOUNT_CENTS) return { ok: false, reason: 'too-large' };

  return { ok: true, cents };
}
