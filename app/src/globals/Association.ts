import type { GlobalConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const Association: GlobalConfig = {
  slug: 'association',
  label: "Présentation de l'ADET",
  admin: { group: "L'association" },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identité',
          fields: [
            { name: 'nom', type: 'text', label: 'Nom complet', required: true },
            { name: 'sigle', type: 'text', defaultValue: 'ADET', required: true },
            {
              name: 'accroche',
              type: 'text',
              label: "Phrase d'accroche (accueil)",
              admin: { description: 'Une phrase courte et parlante, affichée en grand sur la page d’accueil.' },
            },
            { name: 'introduction', type: 'textarea', label: "Texte d'introduction (accueil)" },
            { name: 'imageAccueil', type: 'upload', relationTo: 'media', label: "Photo d'accueil" },
            {
              name: 'chiffres',
              type: 'array',
              label: "Chiffres clés de l'association",
              labels: { singular: 'Chiffre', plural: 'Chiffres' },
              admin: { description: 'Ex. : « 3 » / « régions ciblées ». Affichés sur l’accueil.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'valeur', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'libelle', type: 'text', label: 'Libellé', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Vision, mission, valeurs',
          fields: [
            { name: 'vision', type: 'textarea', required: true },
            { name: 'mission', type: 'textarea', required: true },
            {
              name: 'valeurs',
              type: 'array',
              labels: { singular: 'Valeur', plural: 'Valeurs' },
              fields: [
                { name: 'titre', type: 'text', required: true },
                { name: 'description', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Axes stratégiques',
          fields: [
            {
              name: 'axes',
              type: 'array',
              labels: { singular: 'Axe', plural: 'Axes' },
              fields: [
                { name: 'titre', type: 'text', required: true },
                {
                  name: 'objectifs',
                  type: 'array',
                  labels: { singular: 'Objectif', plural: 'Objectifs' },
                  fields: [{ name: 'texte', type: 'text', required: true }],
                },
              ],
            },
          ],
        },
        {
          label: 'Démarche',
          fields: [
            {
              name: 'demarche',
              type: 'array',
              label: "Plan d'action / démarche",
              labels: { singular: 'Étape', plural: 'Étapes' },
              fields: [
                { name: 'titre', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: "Zone d'intervention",
          fields: [
            { name: 'zoneTitre', type: 'text', label: 'Titre', defaultValue: 'La Casamance naturelle, notre point de départ' },
            { name: 'zoneTexte', type: 'textarea', label: 'Pourquoi cette zone ?' },
            {
              name: 'regions',
              type: 'array',
              label: 'Régions prioritaires',
              labels: { singular: 'Région', plural: 'Régions' },
              fields: [{ name: 'nom', type: 'text', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
