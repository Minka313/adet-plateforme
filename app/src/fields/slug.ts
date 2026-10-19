import type { Field } from 'payload'

export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugField = (source = 'titre'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  label: 'Adresse de la page (slug)',
  admin: {
    position: 'sidebar',
    description: 'Générée automatiquement à partir du titre si laissée vide.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const from = data?.[source]
        return typeof from === 'string' ? slugify(from) : value
      },
    ],
  },
})
