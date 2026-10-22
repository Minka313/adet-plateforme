import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'
import { indicateursField, reperesField } from '../fields/indicateurs'
import { slugField } from '../fields/slug'

export const Filieres: CollectionConfig = {
  slug: 'filieres',
  labels: { singular: 'Filière', plural: 'Économie et filières' },
  admin: {
    group: 'Découvrir Kolda',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'ordre'],
    description: 'Les filières et ressources économiques du territoire (axe 3 : ressources locales).',
  },
  hooks: hooksRegeneration,
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'ordre',
  fields: [
    { name: 'nom', type: 'text', localized: true, required: true },
    slugField('nom'),
    { name: 'ordre', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      name: 'icone',
      type: 'select',
      defaultValue: 'ressources',
      admin: { position: 'sidebar', description: 'Pictogramme affiché sans photo.' },
      options: [
        { label: 'Ressources (feuille)', value: 'ressources' },
        { label: 'Partenariats', value: 'partenariats' },
        { label: 'Capacités', value: 'capacites' },
        { label: 'Innovation', value: 'innovation' },
        { label: 'Suivi', value: 'suivi' },
      ],
    },
    {
      name: 'resume',
      type: 'textarea',
      localized: true,
      label: 'Résumé',
      required: true,
      maxLength: 300,
    },
    {
      name: 'presentation',
      type: 'textarea',
      localized: true,
      label: 'Présentation',
      admin: { description: 'Séparez les paragraphes par une ligne vide.' },
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    indicateursField,
    reperesField,
  ],
}
