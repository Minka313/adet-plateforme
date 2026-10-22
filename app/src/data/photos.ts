/**
 * Photos d'illustration par défaut (Wikimedia Commons, licences libres), affichées tant que
 * l'ADET n'a pas déposé ses propres photos dans /admin → « Photos du site ».
 * Les crédits sont obligatoires (CC BY / CC BY-SA) : légende sur la photo + mentions légales.
 */
export const EMPLACEMENTS = ['accueil1', 'accueil2', 'accueil3', 'kolda', 'opportunites', 'formations'] as const
export type Emplacement = (typeof EMPLACEMENTS)[number]

export type PhotoParDefaut = {
  src: string
  width: number
  height: number
  alt: { fr: string; en: string }
  auteur: string
  licence: string
  source: string
}

export const PHOTOS_PAR_DEFAUT: Record<Emplacement, PhotoParDefaut> = {
  accueil1: {
    src: '/photos/accueil-riz.webp',
    width: 1417,
    height: 944,
    alt: { fr: 'Récolte du riz à Boucotte, en Casamance', en: 'Rice harvest in Boucotte, Casamance' },
    auteur: 'Olivier Epron',
    licence: 'CC BY 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:R%C3%A9colte_riz_boucotte.jpg',
  },
  accueil2: {
    src: '/photos/accueil-fleuve.webp',
    width: 1600,
    height: 1200,
    alt: { fr: 'Pirogue sur le fleuve Casamance', en: 'Pirogue on the Casamance river' },
    auteur: 'Armadyou',
    licence: 'Domaine public',
    source: 'https://commons.wikimedia.org/wiki/File:Fleuve_casamance.jpg',
  },
  accueil3: {
    src: '/photos/accueil-kolda.webp',
    width: 1600,
    height: 1067,
    alt: { fr: 'Cour ombragée d’une concession à Kolda', en: 'Shaded family courtyard in Kolda' },
    auteur: 'GuillaumeG',
    licence: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Kolda_8286.jpg',
  },
  kolda: {
    src: '/photos/kolda.webp',
    width: 1600,
    height: 1073,
    alt: { fr: 'Champ de coton près de Kounkané, région de Kolda', en: 'Cotton field near Kounkané, Kolda region' },
    auteur: 'Dorothy Voorhees',
    licence: 'CC BY-SA 2.0',
    source: 'https://commons.wikimedia.org/wiki/File:Cottonfields-Kounkane.jpg',
  },
  opportunites: {
    src: '/photos/opportunites.webp',
    width: 1600,
    height: 1067,
    alt: { fr: 'Commerçante vendant des mangues et d’autres fruits au Sénégal', en: 'Trader selling mangoes and other fruit in Senegal' },
    auteur: 'Francis Tapon',
    licence: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Senegalese_women_selling_mangoes_and_other_fruits.jpg',
  },
  formations: {
    src: '/photos/formations.webp',
    width: 1600,
    height: 1075,
    alt: { fr: 'Cours au lycée de Diaobé, département de Vélingara', en: 'Class at the Diaobé secondary school, Vélingara department' },
    auteur: 'Dorothy Voorhees',
    licence: 'CC BY-SA 2.0',
    source: 'https://commons.wikimedia.org/wiki/File:Biology_class-Senegal.jpg',
  },
}
