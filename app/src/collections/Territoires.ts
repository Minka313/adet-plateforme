import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'
import { indicateursField, reperesField } from '../fields/indicateurs'
import { slugField } from '../fields/slug'

export const Territoires: CollectionConfig = {
  slug: 'territoires',
  labels: { singular: 'Territoire', plural: 'Territoires' },
  admin: {
    group: 'Découvrir Kolda',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'type', 'ordre'],
    description: 'La région de Kolda et ses départements (rubrique « Découvrir Kolda »).',
  },
  hooks: hooksRegeneration,
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'ordre',
  fields: [
    { name: 'nom', type: 'text', localized: true, required: true },
    slugField('nom'),
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'departement',
          options: [
            { label: 'Région', value: 'region' },
            { label: 'Département', value: 'departement' },
          ],
        },
        { name: 'ordre', type: 'number', defaultValue: 10, admin: { description: 'Ordre d’affichage (croissant).' } },
      ],
    },
    {
      name: 'resume',
      type: 'textarea',
      localized: true,
      label: 'Résumé',
      required: true,
      maxLength: 300,
      admin: { description: 'Deux ou trois phrases, affichées sur les cartes.' },
    },
    {
      name: 'presentation',
      type: 'textarea',
      localized: true,
      label: 'Présentation',
      admin: { description: 'Texte de la page. Séparez les paragraphes par une ligne vide.' },
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    indicateursField,
    reperesField,
  ],
}
