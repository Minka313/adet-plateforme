import type { Territoire } from '@/payload-types'

/** Couleur d'identité de chaque département dans les graphiques (charte ADET, lisibilité vérifiée pour les daltoniens) */
export const COULEUR_DEPARTEMENT: Record<string, string> = {
  kolda: '#3c6ef1',
  velingara: '#0b7a1e',
  'medina-yoro-foulah': '#c99a06',
}

/** Couleurs de la carte, par nom de département, assorties à COULEUR_DEPARTEMENT */
export const COULEURS_CARTE: Record<string, { fond: string; texte: string }> = {
  Kolda: { fond: COULEUR_DEPARTEMENT.kolda, texte: '#ffffff' },
  Vélingara: { fond: COULEUR_DEPARTEMENT.velingara, texte: '#ffffff' },
  'Médina Yoro Foulah': { fond: COULEUR_DEPARTEMENT['medina-yoro-foulah'], texte: '#0f2240' },
}

/** Noms des départements dans les données de la carte → slug de leur fiche */
export const SLUG_PAR_DEPARTEMENT: Record<string, string> = {
  Kolda: 'kolda',
  Vélingara: 'velingara',
  'Médina Yoro Foulah': 'medina-yoro-foulah',
}

/** Nom court d'un département (« Vélingara » plutôt que « Département de Vélingara ») */
const NOMS_COURTS: Record<string, string> = { kolda: 'Kolda', velingara: 'Vélingara', 'medina-yoro-foulah': 'Médina Yoro Foulah' }
export const nomCourt = (dep: Territoire) => NOMS_COURTS[dep.slug ?? ''] ?? dep.nom

export type Groupe = { arrondissement: string | null; communes: Territoire[]; habitants: number }

/** Communes d'un département regroupées : la commune chef-lieu d'abord, puis chaque arrondissement */
export const parArrondissement = (communes: Territoire[]): Groupe[] => {
  const groupes = new Map<string | null, Territoire[]>()
  for (const c of communes) {
    const cle = c.arrondissement || null
    groupes.set(cle, [...(groupes.get(cle) ?? []), c])
  }
  return [...groupes.entries()]
    .sort(([a], [b]) => (a === null ? -1 : b === null ? 1 : a.localeCompare(b, 'fr')))
    .map(([arrondissement, liste]) => ({
      arrondissement,
      communes: liste.sort((x, y) => (y.habitants ?? 0) - (x.habitants ?? 0)),
      habitants: liste.reduce((s, c) => s + (c.habitants ?? 0), 0),
    }))
}

export const idDepartement = (c: Territoire) => (typeof c.departement === 'object' ? c.departement?.id : c.departement)

export const total = (communes: Territoire[]) => communes.reduce((s, c) => s + (c.habitants ?? 0), 0)
