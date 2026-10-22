import type { GlobalConfig } from 'payload'

import { revaliderGlobal } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'

const aide = 'Laissez vide pour garder la photo d’illustration actuelle. Une photo de l’ADET la remplace aussitôt.'

const photo = (name: string, label: string) => ({
  name,
  label,
  type: 'upload' as const,
  relationTo: 'media' as const,
  admin: { description: aide },
})

export const Photos: GlobalConfig = {
  slug: 'photos',
  label: 'Photos du site',
  admin: {
    group: "L'association",
    description:
      'Photos des grandes rubriques du site. Privilégiez des photos de l’ADET sur le terrain, au format paysage, avec l’accord des personnes visibles.',
  },
  hooks: { afterChange: [revaliderGlobal] },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: 'collapsible',
      label: 'Accueil : « La Casamance en images »',
      fields: [
        {
          type: 'row',
          fields: [photo('accueil1', 'Photo 1 (grande)'), photo('accueil2', 'Photo 2'), photo('accueil3', 'Photo 3')],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'En-têtes des rubriques',
      fields: [
        {
          type: 'row',
          fields: [photo('kolda', 'Découvrir Kolda'), photo('opportunites', 'Opportunités'), photo('formations', 'Se former')],
        },
      ],
    },
  ],
}
