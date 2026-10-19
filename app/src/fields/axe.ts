import type { Field } from 'payload'

export const AXES = [
  { label: 'Axe 1 · Renforcement de capacités', value: 'capacites' },
  { label: 'Axe 2 · Partenariats stratégiques', value: 'partenariats' },
  { label: 'Axe 3 · Ressources locales', value: 'ressources' },
  { label: 'Axe 4 · Innovation et technologie', value: 'innovation' },
  { label: 'Axe 5 · Suivi et évaluation', value: 'suivi' },
] as const

export const axeLabel = (value?: string | null): string =>
  AXES.find((a) => a.value === value)?.label ?? ''

export const axeField: Field = {
  name: 'axe',
  type: 'select',
  label: 'Axe stratégique',
  options: AXES.map((a) => ({ ...a })),
  admin: { position: 'sidebar' },
}
