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
    defaultColumns: ['nom', 'type', 'departement', 'habitants'],
    description: 'La région de Kolda, ses départements et ses communes (rubrique « Découvrir Kolda »).',
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
            { label: 'Commune', value: 'commune' },
          ],
        },
        { name: 'ordre', type: 'number', defaultValue: 10, admin: { description: 'Ordre d’affichage (croissant).' } },
      ],
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.type === 'commune' },
      fields: [
        {
          name: 'departement',
          type: 'relationship',
          relationTo: 'territoires',
          label: 'Département',
          index: true,
          filterOptions: { type: { equals: 'departement' } },
          validate: (valeur: unknown, { data }: { data: { type?: string } }) =>
            data?.type !== 'commune' || valeur ? true : 'Choisissez le département de la commune.',
        },
        { name: 'arrondissement', type: 'text', admin: { description: 'Laisser vide pour une commune chef-lieu de département.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'habitants', type: 'number', min: 0, admin: { width: '40%', description: 'Population totale (nombre, sans espaces).' } },
        { name: 'habitantsSource', type: 'text', label: 'Source de la population', defaultValue: 'ANSD, RGPH-5 (2023)' },
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
