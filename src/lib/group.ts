// Les trois membres du groupe, fixés pour cette première version.
export const MEMBERS = ['Lina', 'Noé', 'Sam'] as const;

export type Member = (typeof MEMBERS)[number];

export function isMember(value: unknown): value is Member {
  return typeof value === 'string' && (MEMBERS as readonly string[]).includes(value);
}
