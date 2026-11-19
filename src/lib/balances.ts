import { MEMBERS, isMember, type Member } from './group';

export type ExpenseForBalance = { amountCents: number; paidBy: string };

export type RepaymentForBalance = { fromMember: string; toMember: string; amountCents: number };

export type Balance = { member: Member; cents: number };

// Chaque dépense est partagée à parts égales entre tous les membres.
// Une part est arrondie au centime. Chaque autre membre doit une part
// à la personne qui a payé, qui récupère la somme de ces parts.
// Un remboursement réduit la dette de celui qui rembourse et ce que l’autre doit récupérer.
// Les soldes s’additionnent sur toutes les écritures et leur total vaut toujours 0.
export function computeBalances(
  expenses: readonly ExpenseForBalance[],
  repayments: readonly RepaymentForBalance[] = [],
): Balance[] {
  const totals = new Map<Member, number>(MEMBERS.map((member) => [member, 0]));
  const add = (member: Member, cents: number) => totals.set(member, (totals.get(member) ?? 0) + cents);

  for (const expense of expenses) {
    if (!isMember(expense.paidBy)) continue;

    const share = Math.round(expense.amountCents / MEMBERS.length);

    for (const member of MEMBERS) {
      if (member === expense.paidBy) continue;
      add(member, -share);
      add(expense.paidBy, share);
    }
  }

  for (const repayment of repayments) {
    if (!isMember(repayment.fromMember) || !isMember(repayment.toMember)) continue;
    add(repayment.fromMember, repayment.amountCents);
    add(repayment.toMember, -repayment.amountCents);
  }

  return MEMBERS.map((member) => ({ member, cents: totals.get(member) ?? 0 }));
}

export type RepaymentProposal = { from: Member; to: Member; amountCents: number };

// Pour une personne qui doit de l’argent : elle rembourse celle qui attend le plus
// (la première dans l’ordre du groupe en cas d’égalité), sans dépasser ni sa dette
// ni ce que l’autre doit récupérer.
export function proposalFor(balances: readonly Balance[], debtor: Member): RepaymentProposal | null {
  const debt = -(balances.find((balance) => balance.member === debtor)?.cents ?? 0);
  if (debt <= 0) return null;

  let creditor: Balance | null = null;
  for (const balance of balances) {
    if (balance.cents > 0 && (creditor === null || balance.cents > creditor.cents)) creditor = balance;
  }
  if (creditor === null) return null;

  return { from: debtor, to: creditor.member, amountCents: Math.min(debt, creditor.cents) };
}

// Tire au hasard une personne qui doit encore de l’argent. `null` si tout le monde est quitte.
export function drawRepayment(
  balances: readonly Balance[],
  random: () => number = Math.random,
): RepaymentProposal | null {
  const debtors = balances.filter((balance) => balance.cents < 0);
  if (debtors.length === 0) return null;

  const index = Math.min(Math.floor(random() * debtors.length), debtors.length - 1);
  return proposalFor(balances, debtors[index].member);
}
