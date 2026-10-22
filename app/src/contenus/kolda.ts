/**
 * Contenu initial de la rubrique « Découvrir Kolda ».
 * Source principale : ANSD, RGPH-5 (2023), rapport régional de Kolda (publié en avril 2026).
 * Chargé par `pnpm seed` uniquement si les collections sont vides : les modifications faites
 * dans /admin ne sont jamais écrasées.
 */
import path from 'path'
import { fileURLToPath } from 'url'

import type { Payload } from 'payload'

const DOSSIER_PHOTOS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'photos')

/** Photos d'illustration des filières (Wikimedia Commons), remplaçables dans /admin */
const PHOTOS_FILIERES: Record<string, { alt: [string, string]; credit: string }> = {
  agriculture: {
    alt: ['Récolte du riz à Boucotte, en Casamance', 'Rice harvest in Boucotte, Casamance'],
    credit: 'Olivier Epron · CC BY 3.0 (Wikimedia Commons)',
  },
  'cultures-de-rente': {
    alt: ['Champ de coton près de Kounkané, région de Kolda', 'Cotton field near Kounkané, Kolda region'],
    credit: 'Dorothy Voorhees · CC BY-SA 2.0 (Wikimedia Commons)',
  },
  elevage: {
    alt: ['Éleveurs peuls et leur troupeau au Sénégal (1967)', 'Fula herders and their cattle in Senegal (1967)'],
    credit: 'John Atherton · CC BY-SA 2.0 (Wikimedia Commons)',
  },
  forets: {
    alt: ['Forêt à Kafountine, en Casamance', 'Forest in Kafountine, Casamance'],
    credit: 'Fiskhandlarn · CC BY-SA 2.0 (Wikimedia Commons)',
  },
  commerce: {
    alt: ['Étal de fruits et légumes sur un marché au Sénégal', 'Fruit and vegetable stall at a market in Senegal'],
    credit: 'Pacocreat · CC BY-SA 4.0 (Wikimedia Commons)',
  },
}

const RGPH5 = {
  source: 'ANSD, RGPH-5 (rapport régional de Kolda)',
  annee: '2023',
  lien: 'https://www.ansd.sn/sites/default/files/recensements/rapport/RGPH-5%20RR_KOLDA_27112025_Version%20Formate%CC%81%20ok_Avril%202026_0.pdf',
}
const PRESENTATION = { ...RGPH5, source: 'ANSD, rapport régional RGPH-5 (présentation de la région)', annee: '2026' }
const EHCVM = { source: 'ANSD, EHCVM', annee: '2018-2019', lien: 'https://www.ansd.sn/taxonomy/term/14' }

type Source = { source: string; annee: string; lien: string }
type Indicateur = Source & { valeur: string; fr: string; en: string }
type Repere = { titre: [string, string]; texte: [string, string] }
type Fiche = {
  slug: string
  ordre: number
  nom: [string, string]
  resume: [string, string]
  presentation: [string, string]
  indicateurs: Indicateur[]
  reperes: Repere[]
}

const ind = (valeur: string, fr: string, en: string, s: Source = RGPH5): Indicateur => ({ valeur, fr, en, ...s })

export const TERRITOIRES: (Fiche & { type: 'region' | 'departement' })[] = [
  {
    slug: 'region-de-kolda',
    type: 'region',
    ordre: 0,
    nom: ['La région de Kolda', 'The Kolda region'],
    resume: [
      'Au sud du Sénégal, entre la Gambie et les deux Guinées, la région de Kolda (le Fouladou) est une terre agricole et pastorale, très jeune, au potentiel encore peu exploité.',
      'In southern Senegal, between the Gambia and the two Guineas, the Kolda region (the Fouladou) is a young, farming and herding land whose potential remains largely untapped.',
    ],
    presentation: [
      `Créée en 1984 lors du découpage de l’ancienne région naturelle de Casamance, la région de Kolda a pris sa forme actuelle en 2008, quand son département de Sédhiou est devenu une région à part entière. Elle compte trois départements (Kolda, Vélingara et Médina Yoro Foulah), neuf arrondissements et quarante communes.

Bordée au nord par la Gambie, au sud par la Guinée-Bissau et la Guinée, la région est un carrefour d’échanges : le marché hebdomadaire de Diaobé attire des commerçants de toute la sous-région.

Le Fouladou est majoritairement peul, mais reste cosmopolite : Mandingues, Wolofs, Sarakolés, Diolas, Sérères et d’autres communautés y vivent. Son histoire se lit dans ses sites : la tata de Moussa Molo Baldé à Ndorna, la tombe de Coumba Oudé à Soulabaly, le site mégalithique de Pata ou le village historique de Payoungou, dans le Pakour.

Le potentiel est réel : environ deux millions d’hectares de terres cultivables, le fleuve Casamance et ses affluents, les barrages de l’Anambé et de Ndiandouba, plus de 300 000 hectares de forêts classées. Mais la région reste enclavée (71 % du réseau routier n’est pas revêtu) et seuls 21 % des ménages ont accès à l’électricité. Sa population est l’une des plus jeunes du pays : la moitié des habitants a moins de 16 ans.`,
      `Created in 1984 when the former natural region of Casamance was divided, the Kolda region took its current shape in 2008, when its Sédhiou department became a region in its own right. It has three departments (Kolda, Vélingara and Médina Yoro Foulah), nine districts and forty municipalities.

Bordered by the Gambia to the north and by Guinea-Bissau and Guinea to the south, the region is a crossroads for trade: the weekly market in Diaobé draws traders from across the sub-region.

The Fouladou is mostly Fula, yet remains diverse: Mandinka, Wolof, Soninke, Jola, Serer and other communities live here. Its history can be read in its sites: the tata (fortress) of Moussa Molo Baldé in Ndorna, the tomb of Coumba Oudé in Soulabaly, the megalithic site of Pata and the historic village of Payoungou in the Pakour area.

The potential is real: some two million hectares of arable land, the Casamance river and its tributaries, the Anambé and Ndiandouba dams, more than 300,000 hectares of classified forest. But the region remains isolated (71% of its road network is unpaved) and only 21% of households have access to electricity. Its population is one of the youngest in the country: half of its inhabitants are under 16.`,
    ],
    indicateurs: [
      ind('914 798', 'habitants', 'inhabitants'),
      ind('13 771 km²', 'de superficie, 7 % du territoire national', 'in area, 7% of Senegal', PRESENTATION),
      ind('16 ans', 'âge médian (19 ans au niveau national)', 'median age (19 nationally)'),
      ind('45 %', 'de la population a moins de 15 ans', 'of the population is under 15'),
      ind('54,3 %', 'des 15-24 ans ne sont ni en emploi, ni en études, ni en formation', 'of 15-24 year-olds are not in employment, education or training'),
      ind('36,2 %', 'de la population vit en ville', 'of the population lives in urban areas'),
      ind('63 824', 'ménages agricoles', 'farming households'),
      ind('56,6 %', 'incidence de la pauvreté (37,8 % au niveau national)', 'poverty rate (37.8% nationally)', EHCVM),
    ],
    reperes: [
      { titre: ['Départements', 'Departments'], texte: ['Kolda, Vélingara, Médina Yoro Foulah', 'Kolda, Vélingara, Médina Yoro Foulah'] },
      { titre: ['Frontières', 'Borders'], texte: ['La Gambie au nord, la Guinée-Bissau et la Guinée au sud', 'The Gambia to the north, Guinea-Bissau and Guinea to the south'] },
      { titre: ['Cours d’eau', 'Rivers'], texte: ['Le fleuve Casamance et ses affluents, la Kayanga et l’Anambé', 'The Casamance river and its tributaries, the Kayanga and the Anambé'] },
      { titre: ['Patrimoine', 'Heritage'], texte: ['Tata de Moussa Molo (Ndorna), site mégalithique de Pata, Payoungou', 'Moussa Molo’s tata (Ndorna), Pata megalithic site, Payoungou'] },
    ],
  },
  {
    slug: 'kolda',
    type: 'departement',
    ordre: 1,
    nom: ['Département de Kolda', 'Kolda department'],
    resume: [
      'Le département du chef-lieu régional, le plus densément peuplé : la ville de Kolda y concentre services, administrations et commerce.',
      'The department of the regional capital and the most densely populated: the town of Kolda is home to services, administration and trade.',
    ],
    presentation: [
      `Le département de Kolda abrite la capitale régionale, siège des services de l’État et des principales structures d’accompagnement. C’est le plus densément peuplé de la région, avec près de 91 habitants au km².

L’agriculture et l’élevage y restent les premières activités. Le département compte le plus grand nombre de ménages pratiquant le maraîchage et l’horticulture de la région. La ville accueille aussi une usine d’égrenage de coton de la SODEFITEX.`,
      `Kolda department is home to the regional capital, seat of government services and of the main business support organisations. It is the most densely populated department in the region, with almost 91 inhabitants per km².

Farming and livestock remain the main activities. The department has the region’s largest number of households growing vegetables and horticultural crops. The town is also home to a SODEFITEX cotton ginning plant.`,
    ],
    indicateurs: [
      ind('324 192', 'habitants', 'inhabitants'),
      ind('3 567 km²', 'de superficie', 'in area'),
      ind('90,9', 'habitants au km²', 'inhabitants per km²'),
      ind('44,8 %', 'de la population vit en ville', 'of the population lives in urban areas'),
      ind('21 055', 'ménages agricoles', 'farming households'),
      ind('49,2 %', 'des 15-24 ans ni en emploi, ni en études, ni en formation', 'of 15-24 year-olds not in employment, education or training'),
    ],
    reperes: [
      { titre: ['Arrondissements', 'Districts'], texte: ['Dioulacolon, Mampatim, Saré Bidji', 'Dioulacolon, Mampatim, Saré Bidji'] },
      { titre: ['Point fort', 'Strength'], texte: ['Horticulture : 7 730 ménages, la moitié de la région', 'Horticulture: 7,730 households, half of the region’s total'] },
    ],
  },
  {
    slug: 'velingara',
    type: 'departement',
    ordre: 2,
    nom: ['Département de Vélingara', 'Vélingara department'],
    resume: [
      'Le plus vaste et le plus peuplé des trois départements : terre du riz irrigué de l’Anambé, du coton de Kounkané et du grand marché de Diaobé.',
      'The largest and most populous of the three departments: home to irrigated rice in the Anambé basin, cotton around Kounkané and the great Diaobé market.',
    ],
    presentation: [
      `Vélingara couvre 40 % de la superficie de la région et abrite 44 % de ses habitants. Près de la moitié des ménages agricoles de la région y vivent.

Arrosée par la Kayanga et son affluent l’Anambé, la zone de Kounkané dispose d’eau toute l’année grâce aux barrages de l’Anambé et de Ndiandouba, ce qui en fait le cœur du riz irrigué. Le département accueille aussi Diaobé, dont le marché hebdomadaire (loumo) attire des commerçants de toute la sous-région, et le village historique de Payoungou, dans le Pakour.`,
      `Vélingara covers 40% of the region’s area and is home to 44% of its people. Almost half of the region’s farming households live here.

Watered by the Kayanga river and its tributary the Anambé, the Kounkané area has water all year round thanks to the Anambé and Ndiandouba dams, making it the heart of irrigated rice farming. The department is also home to Diaobé, whose weekly market (loumo) draws traders from across the sub-region, and to the historic village of Payoungou in the Pakour area.`,
    ],
    indicateurs: [
      ind('405 151', 'habitants', 'inhabitants'),
      ind('5 488 km²', 'de superficie', 'in area'),
      ind('73,8', 'habitants au km²', 'inhabitants per km²'),
      ind('43,6 %', 'de la population vit en ville', 'of the population lives in urban areas'),
      ind('28 787', 'ménages agricoles (45 % de la région)', 'farming households (45% of the region)'),
      ind('56,8 %', 'des 15-24 ans ni en emploi, ni en études, ni en formation', 'of 15-24 year-olds not in employment, education or training'),
    ],
    reperes: [
      { titre: ['Arrondissements', 'Districts'], texte: ['Bonconto, Pakour, Saré Coly Sallé', 'Bonconto, Pakour, Saré Coly Sallé'] },
      { titre: ['Marchés', 'Markets'], texte: ['Diaobé (marché sous-régional), Médina Gounass', 'Diaobé (sub-regional market), Médina Gounass'] },
      { titre: ['Eau', 'Water'], texte: ['Bassin de l’Anambé, barrages de l’Anambé et de Ndiandouba', 'Anambé basin, Anambé and Ndiandouba dams'] },
    ],
  },
  {
    slug: 'medina-yoro-foulah',
    type: 'departement',
    ordre: 3,
    nom: ['Département de Médina Yoro Foulah', 'Médina Yoro Foulah department'],
    resume: [
      'Le plus rural des trois départements : un territoire d’élevage et de forêts, riche d’un patrimoine historique majeur du Fouladou.',
      'The most rural of the three departments: a land of livestock and forests, with some of the Fouladou’s most important historic sites.',
    ],
    presentation: [
      `Médina Yoro Foulah est le moins peuplé et le plus rural des trois départements : 95 % de ses habitants vivent en milieu rural et presque tous ses ménages agricoles sont installés hors des villes.

C’est une terre d’élevage et de forêts, mais aussi de mémoire : on y trouve la tata de Moussa Molo Baldé à Ndorna, la tombe de Coumba Oudé à Soulabaly et le site mégalithique de Pata. Les marchés de Médina Yoro Foulah, de Pata et de Fafacourou animent les échanges locaux.`,
      `Médina Yoro Foulah is the least populated and most rural of the three departments: 95% of its inhabitants live in rural areas and almost all of its farming households are outside towns.

It is a land of livestock and forests, and also of memory: it is home to the tata of Moussa Molo Baldé in Ndorna, the tomb of Coumba Oudé in Soulabaly and the megalithic site of Pata. The markets of Médina Yoro Foulah, Pata and Fafacourou drive local trade.`,
    ],
    indicateurs: [
      ind('185 454', 'habitants', 'inhabitants'),
      ind('4 665 km²', 'de superficie', 'in area'),
      ind('39,8', 'habitants au km²', 'inhabitants per km²'),
      ind('5 %', 'de la population vit en ville', 'of the population lives in urban areas'),
      ind('13 982', 'ménages agricoles, dont 97 % en milieu rural', 'farming households, 97% of them rural'),
      ind('58,2 %', 'des 15-24 ans ni en emploi, ni en études, ni en formation', 'of 15-24 year-olds not in employment, education or training'),
    ],
    reperes: [
      { titre: ['Arrondissements', 'Districts'], texte: ['Fafacourou, Ndorna, Niaming', 'Fafacourou, Ndorna, Niaming'] },
      { titre: ['Patrimoine', 'Heritage'], texte: ['Tata de Moussa Molo (Ndorna), tombe de Coumba Oudé (Soulabaly), site de Pata', 'Moussa Molo’s tata (Ndorna), Coumba Oudé’s tomb (Soulabaly), Pata site'] },
    ],
  },
]

export const FILIERES: (Fiche & { icone: string })[] = [
  {
    slug: 'agriculture',
    ordre: 1,
    icone: 'ressources',
    nom: ['Agriculture et riz', 'Farming and rice'],
    resume: [
      'Première activité de la région : mil, maïs, sorgho, riz et fonio sur environ deux millions d’hectares cultivables, avec le riz irrigué du bassin de l’Anambé.',
      'The region’s main activity: millet, maize, sorghum, rice and fonio on some two million hectares of arable land, plus irrigated rice in the Anambé basin.',
    ],
    presentation: [
      `L’agriculture mobilise la majeure partie des actifs de la région. Les principales cultures vivrières sont le mil, le maïs, le sorgho, le riz et le fonio.

Les ressources en eau sont importantes : le fleuve Casamance et ses affluents, les nappes souterraines et les barrages de l’Anambé et de Ndiandouba, qui permettent de cultiver toute l’année dans la zone de Kounkané. Le maraîchage et l’horticulture concernent déjà plus de 15 000 ménages, surtout dans le département de Kolda.`,
      `Farming employs most of the region’s workforce. The main food crops are millet, maize, sorghum, rice and fonio.

Water resources are substantial: the Casamance river and its tributaries, groundwater, and the Anambé and Ndiandouba dams, which allow year-round farming around Kounkané. Vegetable growing and horticulture already involve more than 15,000 households, mainly in Kolda department.`,
    ],
    indicateurs: [
      ind('2 millions', 'd’hectares de terres cultivables (estimation)', 'hectares of arable land (estimate)', PRESENTATION),
      ind('58 003', 'ménages pratiquent l’agriculture', 'households farm crops'),
      ind('15 214', 'ménages pratiquent l’horticulture', 'households grow horticultural crops'),
    ],
    reperes: [
      { titre: ['Cultures vivrières', 'Food crops'], texte: ['Mil, maïs, sorgho, riz, fonio', 'Millet, maize, sorghum, rice, fonio'] },
      { titre: ['Riz irrigué', 'Irrigated rice'], texte: ['Bassin de l’Anambé (Vélingara)', 'Anambé basin (Vélingara)'] },
    ],
  },
  {
    slug: 'cultures-de-rente',
    ordre: 2,
    icone: 'partenariats',
    nom: ['Coton et cultures de rente', 'Cotton and cash crops'],
    resume: [
      'Arachide, coton, niébé, manioc et sésame : des cultures de rente qui font vivre de nombreuses familles, autour notamment de l’usine de coton de la SODEFITEX à Kolda.',
      'Groundnuts, cotton, cowpeas, cassava and sesame: cash crops that support many families, notably around the SODEFITEX cotton plant in Kolda.',
    ],
    presentation: [
      `Les principales cultures de rente de la région sont l’arachide, le coton, le niébé, le manioc et le sésame.

Le coton structure une partie de l’économie locale : la SODEFITEX dispose d’une usine d’égrenage à Kolda, et les champs de coton sont nombreux autour de Kounkané, dans le département de Vélingara. Transformer davantage ces productions sur place est l’une des pistes pour créer de l’emploi.`,
      `The region’s main cash crops are groundnuts, cotton, cowpeas, cassava and sesame.

Cotton underpins part of the local economy: SODEFITEX runs a ginning plant in Kolda, and cotton fields are common around Kounkané in Vélingara department. Processing more of this produce locally is one way to create jobs.`,
    ],
    indicateurs: [],
    reperes: [
      { titre: ['Cultures', 'Crops'], texte: ['Arachide, coton, niébé, manioc, sésame', 'Groundnuts, cotton, cowpeas, cassava, sesame'] },
      { titre: ['Coton', 'Cotton'], texte: ['Usine SODEFITEX à Kolda, zone de Kounkané', 'SODEFITEX plant in Kolda, Kounkané area'] },
    ],
  },
  {
    slug: 'elevage',
    ordre: 3,
    icone: 'capacites',
    nom: ['Élevage', 'Livestock'],
    resume: [
      'Deuxième activité de la région : la longue saison des pluies assure des pâturages presque toute l’année à un élevage porté par la communauté peule.',
      'The region’s second activity: a long rainy season provides pasture almost all year round for herding, a mainstay of the Fula community.',
    ],
    presentation: [
      `Kolda est une zone agropastorale. L’élevage est la deuxième activité du secteur primaire après l’agriculture : il fournit revenus, viande, lait et œufs.

La communauté peule, majoritaire, en a fait une activité centrale, et la pluviométrie, l’une des plus longues du pays, garantit des pâturages presque toute l’année. On y élève des bovins, des ovins, des caprins, des équins, des ânes, des porcs et de la volaille.`,
      `Kolda is an agro-pastoral area. Livestock is the second activity in the primary sector after crop farming, providing income, meat, milk and eggs.

The Fula community, the majority, has made herding a central activity, and the rainy season, one of the longest in the country, ensures pasture almost all year round. Cattle, sheep, goats, horses, donkeys, pigs and poultry are raised here.`,
    ],
    indicateurs: [ind('53 971', 'ménages pratiquent l’élevage', 'households raise livestock')],
    reperes: [
      { titre: ['Espèces', 'Species'], texte: ['Bovins, ovins, caprins, équins, asins, porcins, volaille', 'Cattle, sheep, goats, horses, donkeys, pigs, poultry'] },
      { titre: ['Produits', 'Products'], texte: ['Viande, lait, œufs', 'Meat, milk, eggs'] },
    ],
  },
  {
    slug: 'forets',
    ordre: 4,
    icone: 'suivi',
    nom: ['Forêts et produits de cueillette', 'Forests and wild produce'],
    resume: [
      'Plus de 300 000 hectares de forêts classées et une faune variée : une richesse à protéger et à valoriser durablement.',
      'More than 300,000 hectares of classified forest and varied wildlife: a resource to protect and use sustainably.',
    ],
    presentation: [
      `La région compte 302 660 hectares de forêts classées, répartis en dix-huit massifs, soit un taux de classement supérieur à 20 %. Le domaine protégé couvre 155 681 hectares supplémentaires.

Ces forêts fournissent du bois de service, des fruits, de la gomme, du miel sauvage, des feuilles et des écorces. La faune y est abondante. Leur gestion durable est au cœur de l’axe 3 de l’ADET : valoriser les ressources locales sans les épuiser.`,
      `The region has 302,660 hectares of classified forest in eighteen blocks, a classification rate above 20%. Protected land covers another 155,681 hectares.

These forests provide timber, fruit, gum, wild honey, leaves and bark, and are home to abundant wildlife. Managing them sustainably is at the heart of ADET’s third pillar: making the most of local resources without depleting them.`,
    ],
    indicateurs: [
      ind('302 660 ha', 'de forêts classées, en 18 massifs', 'of classified forest, in 18 blocks', PRESENTATION),
      ind('155 681 ha', 'de domaine protégé', 'of protected land', PRESENTATION),
    ],
    reperes: [
      { titre: ['Produits', 'Products'], texte: ['Bois de service, fruits, gomme, miel sauvage, feuilles, écorces', 'Timber, fruit, gum, wild honey, leaves, bark'] },
    ],
  },
  {
    slug: 'commerce',
    ordre: 5,
    icone: 'innovation',
    nom: ['Commerce et marchés', 'Trade and markets'],
    resume: [
      'Au carrefour de la Gambie et des deux Guinées, la région vit au rythme de ses marchés hebdomadaires, à commencer par celui de Diaobé.',
      'At the crossroads of the Gambia and the two Guineas, the region lives to the rhythm of its weekly markets, starting with Diaobé.',
    ],
    presentation: [
      `Sa position de carrefour fait de la région de Kolda un lieu d’échanges commerciaux sous-régionaux. Le marché hebdomadaire de Diaobé, dans le département de Vélingara, en est le symbole.

D’autres marchés animent le territoire : Mandat Douane, Médina Gounass, Saré Yoba, Pata, Médina Yoro Foulah et Fafacourou. L’enclavement reste toutefois un frein : sur 1 900 km de routes, 71 % ne sont pas revêtues.`,
      `Its crossroads location makes the Kolda region a hub for sub-regional trade, symbolised by the weekly market in Diaobé, in Vélingara department.

Other markets serve the area: Mandat Douane, Médina Gounass, Saré Yoba, Pata, Médina Yoro Foulah and Fafacourou. Isolation remains an obstacle, however: of 1,900 km of roads, 71% are unpaved.`,
    ],
    indicateurs: [ind('71 %', 'du réseau routier n’est pas revêtu (1 900 km au total)', 'of the road network is unpaved (1,900 km in total)', PRESENTATION)],
    reperes: [
      { titre: ['Marchés', 'Markets'], texte: ['Diaobé, Mandat Douane, Médina Gounass, Saré Yoba, Pata, Fafacourou', 'Diaobé, Mandat Douane, Médina Gounass, Saré Yoba, Pata, Fafacourou'] },
    ],
  },
]

async function creerFiches(payload: Payload, collection: 'territoires' | 'filieres', fiches: (Fiche & Record<string, unknown>)[]) {
  const { totalDocs } = await payload.count({ collection })
  if (totalDocs > 0) return false
  for (const f of fiches) {
    const { nom, resume, presentation, indicateurs, reperes, ...reste } = f
    const cree = await payload.create({
      collection,
      locale: 'fr',
      context: { sansRegeneration: true },
      data: {
        ...(reste as object),
        nom: nom[0],
        resume: resume[0],
        presentation: presentation[0],
        indicateurs: indicateurs.map((i) => ({ valeur: i.valeur, libelle: i.fr, source: i.source, annee: i.annee, lien: i.lien })),
        reperes: reperes.map((r) => ({ titre: r.titre[0], texte: r.texte[0] })),
      } as never,
    })
    await payload.update({
      collection,
      id: cree.id,
      locale: 'en',
      context: { sansRegeneration: true },
      data: {
        nom: nom[1],
        resume: resume[1],
        presentation: presentation[1],
        indicateurs: (cree.indicateurs ?? []).map((i, n) => ({ ...i, libelle: indicateurs[n].en })),
        reperes: (cree.reperes ?? []).map((r, n) => ({ ...r, titre: reperes[n].titre[1], texte: reperes[n].texte[1] })),
      },
    })
  }
  return true
}

/** Ajoute la photo d'illustration aux filières qui n'en ont pas (ne remplace jamais un choix fait dans /admin) */
async function ajouterPhotosFilieres(payload: Payload) {
  const { docs } = await payload.find({ collection: 'filieres', limit: 100, depth: 0 })
  for (const f of docs) {
    const photo = f.slug ? PHOTOS_FILIERES[f.slug] : undefined
    if (f.photo || !photo) continue
    const media = await payload.create({
      collection: 'media',
      locale: 'fr',
      filePath: path.join(DOSSIER_PHOTOS, `${f.slug}.webp`),
      data: { alt: photo.alt[0], credit: photo.credit },
    })
    await payload.update({ collection: 'media', id: media.id, locale: 'en', data: { alt: photo.alt[1] } })
    await payload.update({ collection: 'filieres', id: f.id, data: { photo: media.id }, context: { sansRegeneration: true } })
  }
}

export async function chargerKolda(payload: Payload) {
  const t = await creerFiches(payload, 'territoires', TERRITOIRES)
  const f = await creerFiches(payload, 'filieres', FILIERES)
  await ajouterPhotosFilieres(payload)
  payload.logger.info(`Découvrir Kolda : territoires ${t ? 'créés' : 'déjà présents'}, filières ${f ? 'créées' : 'déjà présentes'}.`)
}
