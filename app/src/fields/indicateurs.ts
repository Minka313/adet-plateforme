import type { Field } from 'payload'

/**
 * Chiffres sourcés (principe « Toujours sourcer » de docs/vision-plateforme.md) :
 * chaque valeur porte obligatoirement sa source et son année.
 */
export const indicateursField: Field = {
  name: 'indicateurs',
  type: 'array',
  label: 'Chiffres clés',
  labels: { singular: 'Chiffre', plural: 'Chiffres' },
  admin: { description: 'Chaque chiffre affiche sa source et son année. N’en saisissez pas sans source fiable.' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'valeur', type: 'text', required: true, admin: { width: '25%', description: 'Ex. : 914 798 ou 54,3 %' } },
        { name: 'libelle', type: 'text', localized: true, label: 'Libellé', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'source', type: 'text', required: true, admin: { width: '40%', description: 'Ex. : ANSD, RGPH-5' } },
        { name: 'annee', type: 'text', label: 'Année', required: true, admin: { width: '15%' } },
        { name: 'lien', type: 'text', label: 'Lien vers la source', admin: { width: '45%' } },
      ],
    },
  ],
}

/** Repères : courtes lignes de texte (arrondissements, sites, marchés…) */
export const reperesField: Field = {
  name: 'reperes',
  type: 'array',
  label: 'Repères',
  labels: { singular: 'Repère', plural: 'Repères' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'titre', type: 'text', localized: true, required: true, admin: { width: '35%' } },
        { name: 'texte', type: 'text', localized: true, required: true },
      ],
    },
  ],
}
