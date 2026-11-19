import type { RepaymentProposal } from './balances';

export type DrawResult =
  | { status: 'proposal'; proposal: RepaymentProposal; stateKey: string }
  | { status: 'settled' }
  | { status: 'error' };

export type ConfirmResult =
  | { status: 'confirmed'; proposal: RepaymentProposal }
  | { status: 'conflict' }
  | { status: 'error' };

export const SETTLED_MESSAGE = 'Tout le monde est quitte : il n’y a rien à rembourser.';
export const CONFLICT_MESSAGE = 'Les soldes ont changé depuis le tirage. Relance un tirage.';
