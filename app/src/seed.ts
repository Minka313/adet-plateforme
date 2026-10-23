/**
 * Pré-remplit le back-office avec le contenu du cadre stratégique de l'ADET.
 * Usage : pnpm seed   (ne touche pas aux réalisations, actualités, équipe…)
 */
import { getPayload } from 'payload'

import { chargerActualites } from './contenus/actualites'
import { chargerKolda } from './contenus/kolda'
import { chargerStructures } from './contenus/structures'
import config from './payload.config'

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'association',
  locale: 'fr',
  data: {
    nom: 'Association pour la promotion du Développement Économique Territorial',
    sigle: 'ADET',
    accroche: 'Révéler le potentiel économique de Kolda et de la Casamance',
    introduction:
      "La Casamance a tout pour réussir : des terres fertiles, de fortes pluies, des forêts et des ressources naturelles. Pourtant, beaucoup de jeunes manquent d'informations sur les formations, l'accompagnement et les financements. L'ADET réunit les acteurs du territoire pour changer cela.",
    constat:
      "La Casamance est une « zone des paradoxes » : malgré des terres fertiles, une forte pluviométrie et d'importantes ressources naturelles, elle peine à se développer. Le chômage des jeunes y est élevé et nourrit la migration irrégulière, faute d'accès à l'information, à la formation, à l'accompagnement et au financement.",
    reponse:
      "L'ADET fédère les acteurs du territoire autour d'une démarche concertée : renforcer les compétences, mobiliser des partenariats, valoriser les ressources locales et mesurer l'impact de chaque initiative, dans le respect de l'environnement et du cadre de vie.",
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

// ---------- Version anglaise (mêmes éléments de liste, textes traduits) ----------
const assoFr = await payload.findGlobal({ slug: 'association', locale: 'fr' })
const avecIds = <T extends { id?: string | null }, U>(liste: T[] | null | undefined, traductions: U[]) =>
  (liste ?? []).map((el, i) => ({ ...el, ...traductions[i] }))

await payload.updateGlobal({
  slug: 'association',
  locale: 'en',
  data: {
    nom: 'Association for the Promotion of Territorial Economic Development',
    accroche: 'Unlocking the economic potential of Kolda and Casamance',
    introduction:
      'Casamance has everything it takes to thrive: fertile land, abundant rainfall, forests and natural resources. Yet many young people lack information on training, business support and funding. ADET brings the territory’s stakeholders together to change that.',
    constat:
      'Casamance is a “land of paradoxes”: despite fertile land, high rainfall and abundant natural resources, it struggles to develop. Youth unemployment is high and fuels irregular migration, due to limited access to information, training, business support and funding.',
    reponse:
      'ADET brings the territory’s stakeholders together around a concerted approach: building skills, mobilising partnerships, making the most of local resources and measuring the impact of every initiative, with respect for the environment and living conditions.',
    chiffres: avecIds(assoFr.chiffres, [
      { libelle: 'strategic pillars' },
      { libelle: 'priority regions' },
      { libelle: 'areas of expertise' },
    ]),
    vision:
      'ADET aims to be a major player in promoting sustainable territorial economic development, by creating an environment conducive to inclusive growth and prosperity for all communities.',
    mission:
      'To promote and support territorial economic development initiatives through innovation, collaboration and the optimal use of local resources. We are committed to strengthening the capacities of local stakeholders and fostering strategic partnerships for harmonious and sustainable development.',
    valeurs: avecIds(assoFr.valeurs, [
      { titre: 'Innovation', description: 'Encouraging creativity and innovation in all our initiatives.' },
      { titre: 'Inclusion', description: 'Promoting inclusion and equity for all communities, without discrimination.' },
      { titre: 'Collaboration', description: 'Valuing partnerships and teamwork to achieve our goals.' },
      { titre: 'Sustainability', description: 'Promoting sustainable, environmentally friendly practices.' },
      { titre: 'Transparency', description: 'Ensuring transparency and accountability in everything we do.' },
      { titre: 'Integrity', description: 'Acting with honesty and ethics in all our actions.' },
      { titre: 'Respect', description: 'Treating every individual with respect and consideration.' },
      { titre: 'Solidarity', description: 'Encouraging solidarity and mutual support within our organisation and communities.' },
    ]),
    axes: (assoFr.axes ?? []).map((axe, i) => {
      const t = [
        { titre: 'Capacity building for local stakeholders', objectifs: ['Design and deliver training and skills development programmes for local stakeholders.', 'Support entrepreneurial initiatives and local innovation.'] },
        { titre: 'Promoting strategic partnerships', objectifs: ['Build and strengthen partnerships with public and private actors, international organisations and local communities.', 'Facilitate inter-municipal cooperation on economic development projects.'] },
        { titre: 'Making the most of local resources', objectifs: ['Identify and promote the natural and cultural resources of each territory.', 'Promote efficient and sustainable management of local resources.'] },
        { titre: 'Innovation and technology', objectifs: ['Integrate innovative technologies into economic development projects.', 'Encourage Civic Tech initiatives and digital solutions for territorial development.'] },
        { titre: 'Monitoring and evaluation', objectifs: ['Set up monitoring and evaluation mechanisms to measure the impact of initiatives and projects.', 'Ensure continuous improvement based on feedback and lessons learned.'] },
      ][i]
      return { ...axe, titre: t.titre, objectifs: (axe.objectifs ?? []).map((o, j) => ({ ...o, texte: t.objectifs[j] })) }
    }),
    demarche: avecIds(assoFr.demarche, [
      { titre: 'Assess needs', description: 'Conduct surveys and studies to establish a baseline and identify the specific needs of each territory.' },
      { titre: 'Mobilise resources', description: 'Seek funding and partners to support development initiatives.' },
      { titre: 'Implement', description: 'Launch pilot projects in different territories to test and refine our approaches.' },
      { titre: 'Monitor and evaluate', description: 'Carry out regular monitoring and evaluations to analyse results and make the necessary adjustments.' },
      { titre: 'Capitalise', description: 'Document and capitalise on approaches before scaling up to other territories.' },
    ]),
    zoneTitre: 'Natural Casamance, our starting point',
    zoneTexte:
      'ADET aims to cover the whole of Senegal, step by step. It works first in natural Casamance, a “land of paradoxes” which, despite major assets (agriculture, forestry and livestock, high rainfall, arable land, forest resources), struggles to develop. Youth unemployment is high and drives irregular migration. Limited access to information, vocational training, business support and funding holds back entrepreneurship. ADET responds with a concerted approach that brings together all development stakeholders, with respect for the environment and living conditions.',
    regions: assoFr.regions,
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

const departementsEn = [
  { nom: 'Coordination', missions: ['Executive management: strategic and operational leadership of the association.', 'Administrative office: day-to-day management of correspondence, reports…'] },
  { nom: 'Training and Skills Development', missions: ['Coordination of training and skills development programmes.', 'Identification of specialists offering training tailored to local stakeholders’ needs.'] },
  { nom: 'Strategic Partnerships', missions: ['Building and maintaining relationships with strategic partners.', 'Developing and managing partnerships with various organisations.'] },
  { nom: 'Communication, Innovation and Technology', missions: ['Communication strategies to raise the visibility of the association’s work.', 'Overseeing the integration of innovative technologies into projects.', 'Designing technology solutions for territorial development.'] },
  { nom: 'Monitoring and Evaluation', missions: ['Managing project monitoring and evaluation activities.', 'Collecting and analysing data to assess the impact of initiatives.'] },
  { nom: 'Finance and Administration', missions: ['Overseeing the association’s financial management.', 'Managing project finances and budgets.', 'Ensuring the smooth administrative running of the association.'] },
]

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
    const cree = await payload.create({
      collection: 'departements',
      locale: 'fr',
      data: { nom: d.nom, sigle: d.sigle, ordre, missions: d.missions.map((texte) => ({ texte })) },
    })
    const t = departementsEn[ordre]
    await payload.update({
      collection: 'departements',
      id: cree.id,
      locale: 'en',
      data: { nom: t.nom, missions: (cree.missions ?? []).map((m, i) => ({ ...m, texte: t.missions[i] })) },
    })
  }
}

await chargerKolda(payload)
await chargerStructures(payload)
await chargerActualites(payload)

payload.logger.info('Contenu du cadre stratégique chargé.')
process.exit(0)
