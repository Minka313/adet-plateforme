/**
 * Pré-remplit le back-office avec le contenu du cadre stratégique de l'ADET.
 * Usage : pnpm seed   (ne touche pas aux réalisations, actualités, équipe…)
 */
import { getPayload } from 'payload'

import config from './payload.config'

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'association',
  data: {
    nom: 'Association pour la promotion du Développement Économique Territorial',
    sigle: 'ADET',
    accroche: 'Révéler le potentiel économique de Kolda et de la Casamance',
    introduction:
      "La Casamance a tout pour réussir : des terres fertiles, de fortes pluies, des forêts et des ressources naturelles. Pourtant, beaucoup de jeunes manquent d'informations sur les formations, l'accompagnement et les financements. L'ADET réunit les acteurs du territoire pour changer cela.",
    chiffres: [
      { valeur: '5', libelle: 'axes stratégiques' },
      { valeur: '3', libelle: 'régions prioritaires' },
      { valeur: '6', libelle: 'pôles d’expertise' },
    ],
    vision:
      'ADET vise à être un acteur majeur dans la promotion du développement économique territorial durable, en créant un environnement propice à la croissance inclusive et à la prospérité pour toutes les communautés.',
    mission:
      "Promouvoir et soutenir les initiatives de développement économique territorial à travers l'innovation, la collaboration et l'optimisation des ressources locales. Nous nous engageons à renforcer les capacités des acteurs territoriaux et à favoriser des partenariats stratégiques pour un développement harmonieux et durable.",
    valeurs: [
      { titre: 'Innovation', description: 'Encourager la créativité et l’innovation dans toutes nos initiatives.' },
      { titre: 'Inclusion', description: 'Promouvoir l’inclusion et l’équité pour toutes les communautés, sans discrimination.' },
      { titre: 'Collaboration', description: 'Valoriser les partenariats et le travail en équipe pour atteindre nos objectifs.' },
      { titre: 'Durabilité', description: 'Promouvoir des pratiques durables et respectueuses de l’environnement.' },
      { titre: 'Transparence', description: 'Assurer la transparence et la responsabilité dans toutes nos actions.' },
      { titre: 'Intégrité', description: 'Agir avec honnêteté et éthique dans toutes nos actions.' },
      { titre: 'Respect', description: 'Traiter chaque individu avec respect et considération.' },
      { titre: 'Solidarité', description: 'Encourager la solidarité et le soutien mutuel dans notre organisation et nos communautés.' },
    ],
    axes: [
      {
        titre: 'Renforcement de capacités des acteurs territoriaux',
        objectifs: [
          { texte: 'Développer et offrir des programmes de formation et de développement des compétences pour les acteurs territoriaux.' },
          { texte: 'Soutenir les initiatives entrepreneuriales et l’innovation locale.' },
        ],
      },
      {
        titre: 'Promotion de partenariats stratégiques',
        objectifs: [
          { texte: 'Établir et renforcer des partenariats avec des acteurs publics et privés, des organisations internationales et des communautés locales.' },
          { texte: 'Faciliter la coopération intercommunale pour des projets de développement économique.' },
        ],
      },
      {
        titre: 'Optimisation des ressources locales',
        objectifs: [
          { texte: 'Identifier et valoriser les ressources naturelles et culturelles de chaque territoire.' },
          { texte: 'Promouvoir une gestion efficace et durable des ressources locales.' },
        ],
      },
      {
        titre: 'Innovation et technologie',
        objectifs: [
          { texte: 'Intégrer les technologies innovantes dans les projets de développement économique.' },
          { texte: 'Encourager les initiatives de Civic Tech et les solutions numériques pour le développement territorial.' },
        ],
      },
      {
        titre: 'Suivi et évaluation',
        objectifs: [
          { texte: 'Mettre en place des mécanismes de suivi et d’évaluation pour mesurer l’impact des initiatives et des projets.' },
          { texte: 'Assurer une amélioration continue basée sur les retours et les leçons apprises.' },
        ],
      },
    ],
    demarche: [
      { titre: 'Identifier les besoins', description: 'Conduire des enquêtes et des études pour établir la situation de référence et identifier les besoins spécifiques des territoires.' },
      { titre: 'Mobiliser les ressources', description: 'Rechercher des financements et des partenaires pour soutenir les initiatives de développement.' },
      { titre: 'Mettre en œuvre', description: 'Lancer des projets pilotes dans différents territoires pour tester et ajuster les approches.' },
      { titre: 'Suivre et évaluer', description: 'Effectuer des suivis réguliers et des évaluations pour analyser les résultats et apporter les ajustements nécessaires.' },
      { titre: 'Capitaliser', description: 'Documenter et capitaliser les approches avant de passer à l’échelle dans d’autres territoires.' },
    ],
    zoneTitre: 'La Casamance naturelle, notre point de départ',
    zoneTexte:
      "L'ADET a l'ambition de couvrir tout le Sénégal, de manière progressive. Elle intervient d'abord en Casamance naturelle : une « zone des paradoxes » qui, malgré d'importantes potentialités (agro-sylvo-pastorales, pluviométrie, terres cultivables, ressources forestières), peine à se développer. Le chômage des jeunes y est élevé et pousse à la migration irrégulière. L'accès difficile à l'information, à la formation professionnalisante, à l'accompagnement et au financement freine l'entrepreneuriat. L'ADET répond à ce besoin par une démarche concertée qui réunit tous les acteurs du développement, dans le respect de l'environnement et du cadre de vie.",
    regions: [{ nom: 'Kolda' }, { nom: 'Ziguinchor' }, { nom: 'Sédhiou' }],
  },
})

await payload.updateGlobal({
  slug: 'coordonnees',
  data: {
    adresse: 'Fass Diaé, en face de l’usine de coton de la SODEFITEX\nKolda, Sénégal',
    email: 'adetsenegal1@gmail.com',
    telephones: [{ numero: '76 941 23 25' }, { numero: '77 810 36 36' }, { numero: '77 458 61 05' }],
    recepisse: '12/GRK/YAN',
    ninea: '011193406',
  },
})

const departements = [
  {
    nom: 'Coordination',
    sigle: '',
    missions: [
      'Direction exécutive : direction stratégique et opérationnelle de l’association.',
      'Secrétariat administratif : gestion quotidienne des courriers, des rapports…',
    ],
  },
  {
    nom: 'Formation et Développement des Compétences',
    sigle: 'DFDC',
    missions: [
      'Coordination des programmes de formation et de développement des compétences.',
      'Identification de spécialistes offrant des formations adaptées aux besoins des acteurs territoriaux.',
    ],
  },
  {
    nom: 'Partenariats Stratégiques',
    sigle: 'DPS',
    missions: [
      'Établissement et entretien des relations avec des partenaires stratégiques.',
      'Développement et gestion des partenariats avec diverses organisations.',
    ],
  },
  {
    nom: 'Communication, Innovation et Technologie',
    sigle: 'DCIT',
    missions: [
      'Stratégies de communication pour la visibilité des actions de l’association.',
      'Supervision et intégration des technologies innovantes dans les projets.',
      'Conception de solutions technologiques pour le développement territorial.',
    ],
  },
  {
    nom: 'Suivi et Évaluation',
    sigle: 'DSE',
    missions: [
      'Gestion des activités de suivi et d’évaluation des projets.',
      'Collecte et analyse des données pour évaluer l’impact des initiatives.',
    ],
  },
  {
    nom: 'Finances et Administration',
    sigle: 'DFA',
    missions: [
      'Supervision de la gestion financière de l’association.',
      'Gestion des aspects financiers et des budgets des projets.',
      'Bon fonctionnement administratif de l’association.',
    ],
  },
]

const existants = await payload.count({ collection: 'departements' })
if (existants.totalDocs === 0) {
  for (const [ordre, d] of departements.entries()) {
    await payload.create({
      collection: 'departements',
      data: { nom: d.nom, sigle: d.sigle, ordre, missions: d.missions.map((texte) => ({ texte })) },
    })
  }
}

payload.logger.info('Contenu du cadre stratégique chargé.')
process.exit(0)
