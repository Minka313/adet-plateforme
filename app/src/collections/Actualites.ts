import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'
import { urlApercu } from '../lib/apercu'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'

export const Actualites: CollectionConfig = {
  slug: 'actualites',
  labels: { singular: 'Actualité', plural: 'Actualités' },
  admin: {
    preview: urlApercu('actualites'),
    group: "L'association",
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'categorie', 'date', '_status'],
  },
  versions: { drafts: true },
  hooks: hooksRegeneration,
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  defaultSort: '-date',
  fields: [
    { name: 'titre', localized: true, type: 'text', required: true },
    {
      name: 'resume', localized: true,
      type: 'textarea',
      label: 'Chapeau',
      required: true,
      maxLength: 280,
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'contenu', localized: true, type: 'richText', label: 'Article' },
    slugField(),
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { displayFormat: 'd MMMM yyyy' } },
    },
    {
      name: 'categorie',
      type: 'select',
      label: 'Catégorie',
      defaultValue: 'vie-associative',
      options: [
        { label: 'Vie associative', value: 'vie-associative' },
        { label: 'Formation', value: 'formation' },
        { label: 'Partenariat', value: 'partenariat' },
        { label: 'Événement', value: 'evenement' },
        { label: 'Territoire', value: 'territoire' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
