import type { GlobalConfig } from 'payload'

import { revaliderGlobal } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'

export const Association: GlobalConfig = {
  slug: 'association',
  label: "Présentation de l'ADET",
  admin: { group: "L'association" },
  hooks: { afterChange: [revaliderGlobal] },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identité',
          fields: [
            { name: 'nom', localized: true, type: 'text', label: 'Nom complet', required: true },
            { name: 'sigle', type: 'text', defaultValue: 'ADET', required: true },
            {
              name: 'accroche', localized: true,
              type: 'text',
              label: "Phrase d'accroche (accueil)",
              admin: { description: 'Une phrase courte et parlante, affichée en grand sur la page d’accueil.' },
            },
            { name: 'introduction', localized: true, type: 'textarea', label: "Texte d'introduction (accueil)" },
            { name: 'imageAccueil', type: 'upload', relationTo: 'media', label: "Photo d'accueil" },
            {
              type: 'row',
              fields: [
                { name: 'constat', type: 'textarea', label: 'Le constat', localized: true },
                { name: 'reponse', type: 'textarea', label: 'Notre réponse', localized: true },
              ],
            },
            {
              type: 'collapsible',
              label: 'Mot du directeur (citation, facultatif)',
              admin: { initCollapsed: true },
              fields: [
                { name: 'citation', type: 'textarea', localized: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'citationAuteur', type: 'text', label: 'Auteur' },
                    { name: 'citationFonction', type: 'text', label: 'Fonction', localized: true },
                  ],
                },
                { name: 'citationPhoto', type: 'upload', relationTo: 'media', label: 'Photo' },
              ],
            },
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
                    { name: 'libelle', localized: true, type: 'text', label: 'Libellé', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Vision, mission, valeurs',
          fields: [
            { name: 'vision', localized: true, type: 'textarea', required: true },
            { name: 'mission', localized: true, type: 'textarea', required: true },
            {
              name: 'valeurs',
              type: 'array',
              labels: { singular: 'Valeur', plural: 'Valeurs' },
              fields: [
                { name: 'titre', localized: true, type: 'text', required: true },
                { name: 'description', localized: true, type: 'text' },
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
                { name: 'titre', localized: true, type: 'text', required: true },
                {
                  name: 'objectifs',
                  type: 'array',
                  labels: { singular: 'Objectif', plural: 'Objectifs' },
                  fields: [{ name: 'texte', localized: true, type: 'text', required: true }],
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
                { name: 'titre', localized: true, type: 'text', required: true },
                { name: 'description', localized: true, type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: "Zone d'intervention",
          fields: [
            { name: 'zoneTitre', localized: true, type: 'text', label: 'Titre', defaultValue: 'La Casamance naturelle, notre point de départ' },
            { name: 'zoneTexte', localized: true, type: 'textarea', label: 'Pourquoi cette zone ?' },
            {
              name: 'regions',
              type: 'array',
              label: 'Régions prioritaires',
              labels: { singular: 'Région', plural: 'Régions' },
              fields: [{ name: 'nom', localized: true, type: 'text', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
