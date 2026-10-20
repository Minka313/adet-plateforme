import type { Field } from 'payload'

export const AXES = [
  { label: 'Axe 1 · Renforcement de capacités', value: 'capacites' },
  { label: 'Axe 2 · Partenariats stratégiques', value: 'partenariats' },
  { label: 'Axe 3 · Ressources locales', value: 'ressources' },
  { label: 'Axe 4 · Innovation et technologie', value: 'innovation' },
  { label: 'Axe 5 · Suivi et évaluation', value: 'suivi' },
] as const

export type Axe = (typeof AXES)[number]['value']

const AXES_EN: Record<Axe, string> = {
  capacites: 'Pillar 1 · Capacity building',
  partenariats: 'Pillar 2 · Strategic partnerships',
  ressources: 'Pillar 3 · Local resources',
  innovation: 'Pillar 4 · Innovation and technology',
  suivi: 'Pillar 5 · Monitoring and evaluation',
}

export const axeLabel = (value?: string | null, lang: 'fr' | 'en' = 'fr'): string => {
  const axe = AXES.find((a) => a.value === value)
  if (!axe) return ''
  return lang === 'en' ? AXES_EN[axe.value] : axe.label
}

/** Ordre des axes = ordre des axes du cadre stratégique (index 0 à 4) */
export const AXE_PAR_INDEX: Axe[] = AXES.map((a) => a.value)

export const axeField: Field = {
  name: 'axe',
  type: 'select',
  label: 'Axe stratégique',
  options: AXES.map((a) => ({ ...a })),
  admin: { position: 'sidebar' },
}
