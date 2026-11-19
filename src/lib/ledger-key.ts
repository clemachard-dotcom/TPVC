// Empreinte de l’état des comptes : elle change dès qu’une dépense ou un remboursement
// est ajouté. Un tirage la garde ; la confirmation n’est acceptée que si elle n’a pas changé.
export function ledgerKey(expenses: readonly { id: number }[], repayments: readonly { id: number }[]): string {
  const maxId = (rows: readonly { id: number }[]) => rows.reduce((max, row) => Math.max(max, row.id), 0);
  return `e${expenses.length}.${maxId(expenses)}-r${repayments.length}.${maxId(repayments)}`;
}
