/**
 * Les 40 communes de la région de Kolda, avec leur arrondissement et leur population.
 * Source : ANSD, RGPH-5 (2023), chiffres publiés commune par commune sur le portail officiel Vie publique
 * (pages des départements de Kolda, Vélingara et Médina Yoro Foulah). Les totaux par département
 * correspondent exactement à ceux du recensement : 324 192, 405 149 et 185 456 habitants.
 * Chargé par `pnpm seed` : seules les communes absentes sont créées, rien n'est jamais écrasé.
 */
import type { Payload } from 'payload'

import { slugify } from '../fields/slug'

/** Nom, arrondissement (null pour la commune chef-lieu), habitants */
type Commune = [string, string | null, number]

export const COMMUNES: Record<'kolda' | 'velingara' | 'medina-yoro-foulah', { nom: string; communes: Commune[] }> = {
  kolda: {
    nom: 'Kolda',
    communes: [
      ['Kolda', null, 103_574],
      ['Bagadadji', 'Mampatim', 20_086],
      ['Coumbacara', 'Mampatim', 15_025],
      ['Dabo', 'Mampatim', 9_611],
      ['Dialambéré', 'Mampatim', 16_959],
      ['Mampatim', 'Mampatim', 21_955],
      ['Médina Chérif', 'Mampatim', 15_918],
      ['Dioulacolon', 'Dioulacolon', 32_090],
      ['Guiro Yéro Bocar', 'Dioulacolon', 18_900],
      ['Médina El Hadj', 'Dioulacolon', 15_204],
      ['Salikégné', 'Dioulacolon', 4_641],
      ['Saré Yoba Diéga', 'Dioulacolon', 4_199],
      ['Tankanto Escale', 'Dioulacolon', 18_348],
      ['Saré Bidji', 'Saré Bidji', 22_371],
      ['Thiétty', 'Saré Bidji', 5_311],
    ],
  },
  velingara: {
    nom: 'Vélingara',
    communes: [
      ['Vélingara', null, 45_431],
      ['Bonconto', 'Bonconto', 13_455],
      ['Linkering', 'Bonconto', 22_486],
      ['Médina Gounass', 'Bonconto', 91_085],
      ['Sinthiang Koundara', 'Bonconto', 38_288],
      ['Diaobé-Kabendou', 'Saré Coly Sallé', 41_411],
      ['Kandia', 'Saré Coly Sallé', 28_768],
      ['Kandiaye', 'Saré Coly Sallé', 15_351],
      ['Kounkané', 'Saré Coly Sallé', 16_216],
      ['Némataba', 'Saré Coly Sallé', 11_883],
      ['Saré Coly Sallé', 'Saré Coly Sallé', 24_469],
      ['Ouassadou', 'Pakour', 20_849],
      ['Pakour', 'Pakour', 16_237],
      ['Paroumba', 'Pakour', 19_220],
    ],
  },
  'medina-yoro-foulah': {
    nom: 'Médina Yoro Foulah',
    communes: [
      ['Médina Yoro Foulah', null, 4_936],
      ['Badion', 'Fafacourou', 17_878],
      ['Fafacourou', 'Fafacourou', 10_911],
      ['Bignarabé', 'Ndorna', 7_766],
      ['Bourouco', 'Ndorna', 35_461],
      ['Koulinto', 'Ndorna', 8_675],
      ['Ndorna', 'Ndorna', 16_168],
      ['Dinguiraye', 'Niaming', 18_514],
      ['Kéréwane', 'Niaming', 41_030],
      ['Niaming', 'Niaming', 19_852],
      ['Pata', 'Niaming', 4_265],
    ],
  },
}

/** Adresse de la fiche : « commune-de-kolda » quand le nom est aussi celui du département */
export const slugCommune = (nom: string) => {
  const s = slugify(nom)
  return s in COMMUNES ? `commune-de-${s}` : s
}

const resumes = (dep: string, arrondissement: string | null): [string, string] =>
  arrondissement
    ? [`Commune de l’arrondissement de ${arrondissement}, dans le département de ${dep}.`, `A municipality in ${arrondissement} district, ${dep} department.`]
    : [`Commune chef-lieu du département de ${dep}.`, `The municipality that is the capital of ${dep} department.`]

export async function chargerCommunes(payload: Payload) {
  let crees = 0
  for (const [slugDep, { nom: dep, communes }] of Object.entries(COMMUNES)) {
    const { docs } = await payload.find({ collection: 'territoires', where: { slug: { equals: slugDep } }, limit: 1, depth: 0 })
    const departement = docs[0]
    if (!departement) continue
    for (const [i, [nom, arrondissement, habitants]] of communes.entries()) {
      const slug = slugCommune(nom)
      if ((await payload.count({ collection: 'territoires', where: { slug: { equals: slug } } })).totalDocs) continue
      const [fr, en] = resumes(dep, arrondissement)
      const cree = await payload.create({
        collection: 'territoires',
        locale: 'fr',
        context: { sansRegeneration: true },
        data: { nom, slug, type: 'commune', ordre: i, departement: departement.id, arrondissement, habitants, habitantsSource: 'ANSD, RGPH-5 (2023)', resume: fr },
      })
      await payload.update({ collection: 'territoires', id: cree.id, locale: 'en', context: { sansRegeneration: true }, data: { nom, resume: en } })
      crees++
    }
  }
  payload.logger.info(`Communes : ${crees ? `${crees} créées` : 'déjà présentes'}.`)
}
