import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'
import { urlApercu } from '../lib/apercu'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { axeField } from '../fields/axe'
import { slugField } from '../fields/slug'

export const Realisations: CollectionConfig = {
  slug: 'realisations',
  labels: { singular: 'Réalisation', plural: 'Réalisations' },
  admin: {
    preview: urlApercu('realisations'),
    group: "L'association",
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'axe', 'statut', 'dateDebut', '_status'],
    description: "Projets et activités menés par l'ADET.",
  },
  versions: { drafts: true },
  hooks: hooksRegeneration,
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  defaultSort: '-dateDebut',
  fields: [
    { name: 'titre', localized: true, type: 'text', required: true },
    {
      name: 'resume', localized: true,
      type: 'textarea',
      label: 'Résumé',
      required: true,
      maxLength: 280,
      admin: { description: 'Deux ou trois phrases simples, affichées sur les cartes.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image principale' },
    {
      name: 'chiffres',
      type: 'array',
      label: 'Chiffres clés (impact)',
      labels: { singular: 'Chiffre', plural: 'Chiffres' },
      admin: { description: 'Ex. : « 120 » / « jeunes formés ».' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'valeur', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'libelle', localized: true, type: 'text', label: 'Libellé', required: true },
          ],
        },
      ],
    },
    { name: 'contenu', localized: true, type: 'richText', label: 'Description détaillée' },
    {
      name: 'galerie',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Galerie photos',
    },
    {
      name: 'partenaires',
      type: 'relationship',
      relationTo: 'partenaires',
      hasMany: true,
    },
    slugField(),
    axeField,
    {
      name: 'statut',
      type: 'select',
      defaultValue: 'termine',
      options: [
        { label: 'En cours', value: 'en-cours' },
        { label: 'Terminé', value: 'termine' },
        { label: 'À venir', value: 'a-venir' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'lieu', localized: true,
      type: 'text',
      label: 'Lieu (commune / département)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'dateDebut',
      type: 'date',
      label: 'Date de début',
      admin: { position: 'sidebar', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' } },
    },
    {
      name: 'dateFin',
      type: 'date',
      label: 'Date de fin',
      admin: { position: 'sidebar', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' } },
    },
    {
      name: 'enAvant',
      type: 'checkbox',
      label: "Mettre en avant sur l'accueil",
      admin: { position: 'sidebar' },
    },
  ],
}
