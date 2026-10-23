/**
 * Premier article : les résultats du recensement 2023 (RGPH-5, ANSD) pour la région de Kolda.
 * Chargé par `pnpm seed` seulement s'il n'existe pas déjà (slug identique).
 */
import path from 'path'
import { fileURLToPath } from 'url'

import type { Payload } from 'payload'

const RAPPORT =
  'https://www.ansd.sn/sites/default/files/recensements/rapport/RGPH-5%20RR_KOLDA_27112025_Version%20Formate%CC%81%20ok_Avril%202026_0.pdf'

// Briques du format riche (Lexical) utilisé par le back-office
const texte = (t: string, format = 0) => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })
const bloc = (type: 'paragraph' | 'heading', enfants: object[], extra: object = {}) => ({
  type,
  children: enfants,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...(type === 'paragraph' ? { textFormat: 0, textStyle: '' } : {}),
  ...extra,
})
const p = (t: string) => bloc('paragraph', [texte(t)])
const h2 = (t: string) => bloc('heading', [texte(t)], { tag: 'h2' })
const liste = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((t, i) => ({ type: 'listitem', value: i + 1, children: [texte(t)], direction: 'ltr', format: '', indent: 0, version: 1 })),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})
const lienVers = (t: string, url: string) =>
  bloc('paragraph', [
    { type: 'link', fields: { url, newTab: true, linkType: 'custom' }, children: [texte(t)], direction: 'ltr', format: '', indent: 0, version: 3 },
  ])
const document = (enfants: object[]) => ({
  root: { type: 'root', children: enfants, direction: 'ltr', format: '', indent: 0, version: 1 },
})

const FR = {
  titre: 'Kolda en chiffres : ce que révèle le recensement de 2023',
  resume:
    'Une population très jeune, une majorité de ménages agricoles et plus d’un jeune sur deux sans emploi ni formation : le rapport régional du recensement éclaire les défis du territoire.',
  contenu: document([
    p('L’Agence nationale de la statistique et de la démographie (ANSD) a publié le rapport régional de Kolda du 5e Recensement général de la population et de l’habitat (RGPH-5), réalisé en 2023. Ses chiffres confirment le constat qui a conduit à la création de l’ADET.'),
    h2('Une région parmi les plus jeunes du pays'),
    p('La région compte 914 798 habitants. La moitié d’entre eux a moins de 16 ans (19 ans au niveau national) et 45 % ont moins de 15 ans. Vélingara est le département le plus peuplé (405 151 habitants), devant Kolda (324 192) et Médina Yoro Foulah (185 454).'),
    h2('Une jeunesse en attente d’opportunités'),
    p('54,3 % des jeunes de 15 à 24 ans ne sont ni en emploi, ni en études, ni en formation. La situation est plus marquée chez les jeunes femmes (64,5 %) et en milieu rural (58,2 %).'),
    h2('Une économie tournée vers la terre'),
    liste([
      '63 824 ménages agricoles, dont 72 % en milieu rural ;',
      '58 003 ménages pratiquent l’agriculture et 53 971 l’élevage ;',
      'plus de 15 000 ménages pratiquent l’horticulture, surtout dans le département de Kolda.',
    ]),
    p('Ces chiffres guident l’action de l’ADET : former, accompagner et relier les jeunes aux opportunités de leur territoire. Retrouvez-les en détail dans la rubrique « Découvrir Kolda ».'),
    lienVers('Lire le rapport régional de l’ANSD (PDF)', RAPPORT),
  ]),
}

const EN = {
  titre: 'Kolda in figures: what the 2023 census reveals',
  resume:
    'A very young population, a majority of farming households and more than one young person in two without work or training: the regional census report sheds light on the challenges facing the region.',
  contenu: document([
    p('Senegal’s National Agency for Statistics and Demography (ANSD) has published the Kolda regional report of the 5th General Population and Housing Census (RGPH-5), carried out in 2023. Its figures confirm the situation that led to ADET’s creation.'),
    h2('One of the youngest regions in the country'),
    p('The region has 914,798 inhabitants. Half of them are under 16 (19 nationally) and 45% are under 15. Vélingara is the most populous department (405,151 inhabitants), ahead of Kolda (324,192) and Médina Yoro Foulah (185,454).'),
    h2('Young people waiting for opportunities'),
    p('54.3% of 15-24 year-olds are not in employment, education or training. The figure is higher among young women (64.5%) and in rural areas (58.2%).'),
    h2('An economy rooted in the land'),
    liste([
      '63,824 farming households, 72% of them rural;',
      '58,003 households grow crops and 53,971 raise livestock;',
      'more than 15,000 households grow horticultural crops, mainly in Kolda department.',
    ]),
    p('These figures guide ADET’s work: training, supporting and connecting young people with opportunities in their region. Find them in detail in the “Discover Kolda” section.'),
    lienVers('Read the ANSD regional report (PDF)', RAPPORT),
  ]),
}

const SLUG = 'kolda-en-chiffres-recensement-2023'

export async function chargerActualites(payload: Payload) {
  const existe = await payload.count({ collection: 'actualites', where: { slug: { equals: SLUG } }, overrideAccess: true })
  if (existe.totalDocs > 0) {
    payload.logger.info('Article « Kolda en chiffres » : déjà présent.')
    return
  }
  const image = await payload.create({
    collection: 'media',
    locale: 'fr',
    filePath: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'photos', 'accueil-kolda.webp'),
    data: { alt: 'Cour ombragée d’une concession à Kolda', credit: 'GuillaumeG · CC BY-SA 4.0 (Wikimedia Commons)' },
  })
  await payload.update({ collection: 'media', id: image.id, locale: 'en', data: { alt: 'Shaded family courtyard in Kolda' } })
  const article = await payload.create({
    collection: 'actualites',
    locale: 'fr',
    context: { sansRegeneration: true },
    data: {
      titre: FR.titre,
      resume: FR.resume,
      contenu: FR.contenu as never,
      slug: SLUG,
      image: image.id,
      categorie: 'territoire',
      date: new Date().toISOString(),
      _status: 'published',
    },
  })
  await payload.update({
    collection: 'actualites',
    id: article.id,
    locale: 'en',
    context: { sansRegeneration: true },
    data: { titre: EN.titre, resume: EN.resume, contenu: EN.contenu as never, _status: 'published' },
  })
  payload.logger.info('Article « Kolda en chiffres » publié.')
}
