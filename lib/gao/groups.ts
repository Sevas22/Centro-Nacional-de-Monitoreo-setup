export interface ArmedGroup {
  id: string
  label: string
  keywords: string[]
}

export const armedGroups: ArmedGroup[] = [
  { id: 'eln', label: 'ELN', keywords: ['eln', 'ejército de liberación nacional'] },
  { id: 'clan-del-golfo', label: 'Clan del Golfo', keywords: ['clan del golfo', 'agc', 'autodefensas gaitanistas'] },
  {
    id: 'emc',
    label: 'EMC / Disidencias',
    keywords: ['emc', 'estado mayor central', 'disidencias', 'disidencia de las farc'],
  },
  { id: 'segunda-marquetalia', label: 'Segunda Marquetalia', keywords: ['segunda marquetalia'] },
  { id: 'los-pachenca', label: 'Los Pachenca', keywords: ['los pachenca', 'conquistadores de la sierra'] },
  { id: 'gdo', label: 'Otros GDO', keywords: ['gdo', 'grupo delincuencial organizado', 'banda criminal', 'bacrim'] },
]

export function detectMentionedGroups(text: string): string[] {
  const normalized = text.toLowerCase()
  return armedGroups.filter((g) => g.keywords.some((k) => normalized.includes(k))).map((g) => g.label)
}
