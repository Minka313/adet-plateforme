/**
 * Annuaire initial des structures d'accompagnement (rubriques « Opportunités » et « Se former »).
 * Noms et sites vérifiés en octobre 2026 ; présence à Kolda indiquée uniquement si une source la confirme.
 * Chargé par `pnpm seed` seulement si la collection est vide.
 */
import type { Payload } from 'payload'

type Structure = {
  sigle: string
  type: 'financement' | 'accompagnement' | 'emploi' | 'formation'
  ordre: number
  nom: [string, string]
  description: [string, string]
  aKolda?: [string, string]
  source?: string
  siteWeb: string
}

export const STRUCTURES: Structure[] = [
  {
    sigle: 'DER/FJ',
    type: 'financement',
    ordre: 1,
    nom: [
      'Délégation générale à l’Entrepreneuriat rapide des Femmes et des Jeunes',
      'General Delegation for Rapid Entrepreneurship of Women and Young People',
    ],
    description: [
      'Finance et accompagne les projets des femmes et des jeunes : crédits, formation et suivi des porteurs de projet.',
      'Funds and supports projects led by women and young people: loans, training and follow-up for project holders.',
    ],
    aKolda: [
      'A injecté 13,1 milliards de FCFA dans des projets portés par 8 700 jeunes et femmes des régions de Kolda, Sédhiou et Ziguinchor (APS, octobre 2025).',
      'Has invested 13.1 billion FCFA in projects led by 8,700 young people and women in the Kolda, Sédhiou and Ziguinchor regions (APS, October 2025).',
    ],
    source: 'https://aps.sn/entrepreneuriat-la-der-fj-a-injecte-131-milliards-de-francs-cfa-dans-les-regions-de-kolda-sedhiou-et-ziguinchor/',
    siteWeb: 'https://www.der.sn',
  },
  {
    sigle: 'FONGIP',
    type: 'financement',
    ordre: 2,
    nom: ['Fonds de Garantie des Investissements Prioritaires', 'Priority Investment Guarantee Fund'],
    description: [
      'Se porte garant auprès des banques et des institutions de microfinance pour faciliter l’accès des petites et moyennes entreprises au crédit.',
      'Provides guarantees to banks and microfinance institutions to make it easier for small and medium-sized businesses to obtain credit.',
    ],
    siteWeb: 'https://www.fongip.sn',
  },
  {
    sigle: 'LBA',
    type: 'financement',
    ordre: 3,
    nom: ['La Banque Agricole', 'La Banque Agricole (agricultural bank)'],
    description: [
      'Banque spécialisée dans le financement de l’agriculture, de l’élevage et de la transformation des produits agricoles.',
      'Bank specialising in financing farming, livestock and agricultural processing.',
    ],
    siteWeb: 'https://www.labanqueagricole.sn',
  },
  {
    sigle: 'BNDE',
    type: 'financement',
    ordre: 4,
    nom: ['Banque Nationale pour le Développement Économique', 'National Bank for Economic Development'],
    description: [
      'Banque sénégalaise tournée vers le financement des petites et moyennes entreprises.',
      'Senegalese bank focused on financing small and medium-sized businesses.',
    ],
    siteWeb: 'https://www.bnde.sn',
  },
  {
    sigle: 'ADEPME',
    type: 'accompagnement',
    ordre: 5,
    nom: [
      'Agence de Développement et d’Encadrement des Petites et Moyennes Entreprises',
      'Agency for the Development and Supervision of Small and Medium-sized Enterprises',
    ],
    description: [
      'Accompagne les entrepreneurs et les PME : formalisation, accès aux dispositifs de financement, formation et appui à la mise en marché.',
      'Supports entrepreneurs and SMEs: formalisation, access to funding schemes, training and help with bringing products to market.',
    ],
    aKolda: [
      'Est venue à la rencontre des jeunes porteurs de projet de Kolda pour présenter son accompagnement (Dakarmidi).',
      'Has met young project holders in Kolda to present its support services (Dakarmidi).',
    ],
    source: 'https://www.dakarmidi.net/actualite/de-lidee-a-lentreprise-ladepme-apporte-des-solutions-concretes-a-la-jeunesse-de-kolda/',
    siteWeb: 'https://www.adepme.sn',
  },
  {
    sigle: 'ANPEJ',
    type: 'emploi',
    ordre: 6,
    nom: ['Agence Nationale pour la Promotion de l’Emploi des Jeunes', 'National Agency for the Promotion of Youth Employment'],
    description: [
      'Aide les jeunes à trouver un emploi ou à créer leur activité. Sa plateforme en ligne (Système d’informations sur le marché de l’emploi) rassemble des offres.',
      'Helps young people find a job or start their own business. Its online platform (labour market information system) lists job offers.',
    ],
    siteWeb: 'https://www.anpej.sn',
  },
  {
    sigle: '3FPT',
    type: 'formation',
    ordre: 7,
    nom: [
      'Fonds de Financement de la Formation Professionnelle et Technique',
      'Vocational and Technical Training Fund',
    ],
    description: [
      'Finance des formations professionnelles et techniques, pour les personnes comme pour les entreprises.',
      'Funds vocational and technical training, for individuals as well as businesses.',
    ],
    siteWeb: 'https://www.3fpt.sn',
  },
  {
    sigle: 'ONFP',
    type: 'formation',
    ordre: 8,
    nom: ['Office National de Formation Professionnelle', 'National Vocational Training Office'],
    description: [
      'Organise des formations qualifiantes et de perfectionnement pour les jeunes, les travailleurs et les entreprises.',
      'Runs qualifying and further training courses for young people, workers and businesses.',
    ],
    siteWeb: 'https://www.onfp.sn',
  },
]

export async function chargerStructures(payload: Payload) {
  const { totalDocs } = await payload.count({ collection: 'structures' })
  if (totalDocs > 0) {
    payload.logger.info('Structures d’accompagnement : déjà présentes.')
    return
  }
  for (const s of STRUCTURES) {
    const cree = await payload.create({
      collection: 'structures',
      locale: 'fr',
      context: { sansRegeneration: true },
      data: {
        sigle: s.sigle,
        type: s.type,
        ordre: s.ordre,
        nom: s.nom[0],
        description: s.description[0],
        aKolda: s.aKolda?.[0],
        source: s.source,
        siteWeb: s.siteWeb,
      },
    })
    await payload.update({
      collection: 'structures',
      id: cree.id,
      locale: 'en',
      context: { sansRegeneration: true },
      data: { nom: s.nom[1], description: s.description[1], aKolda: s.aKolda?.[1] },
    })
  }
  payload.logger.info(`Structures d’accompagnement : ${STRUCTURES.length} créées.`)
}
