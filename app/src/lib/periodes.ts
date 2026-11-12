/**
 * Périodes des rapports : « 2026-10 » (mois), « 2026-T3 » (trimestre) ; un rapport ponctuel porte un libellé libre.
 * On rend toujours le rapport de la période écoulée (octobre se rend en novembre), avant le jour limite fixé par le modèle.
 */
export type Periodicite = 'mensuel' | 'trimestriel' | 'ponctuel'

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const deux = (n: number) => String(n).padStart(2, '0')

/** Les `n` dernières périodes écoulées, de la plus récente à la plus ancienne */
export function periodesEcoulees(periodicite: Periodicite, maintenant = new Date(), n = 3): string[] {
  const annee = maintenant.getUTCFullYear()
  const mois = maintenant.getUTCMonth() // 0 à 11
  const resultat: string[] = []
  if (periodicite === 'mensuel') {
    for (let i = 1; i <= n; i++) {
      const d = new Date(Date.UTC(annee, mois - i, 1))
      resultat.push(`${d.getUTCFullYear()}-${deux(d.getUTCMonth() + 1)}`)
    }
  } else if (periodicite === 'trimestriel') {
    const trimestre = Math.floor(mois / 3) // trimestre en cours, 0 à 3
    for (let i = 1; i <= n; i++) {
      const t = trimestre - i
      const a = annee + Math.floor(t / 4)
      resultat.push(`${a}-T${(((t % 4) + 4) % 4) + 1}`)
    }
  }
  return resultat
}

/** La période à rendre maintenant (la dernière écoulée), ou null pour un rapport ponctuel */
export const periodeARendre = (periodicite: Periodicite, maintenant = new Date()) => periodesEcoulees(periodicite, maintenant, 1)[0] ?? null

/** « octobre 2026 », « 3e trimestre 2026 », ou le libellé libre d'un rapport ponctuel */
export function libellePeriode(periode: string): string {
  const mois = /^(\d{4})-(\d{2})$/.exec(periode)
  if (mois) return `${MOIS[Number(mois[2]) - 1]} ${mois[1]}`
  const trimestre = /^(\d{4})-T([1-4])$/.exec(periode)
  if (trimestre) return `${trimestre[2] === '1' ? '1er' : `${trimestre[2]}e`} trimestre ${trimestre[1]}`
  return periode
}

/** Date limite (minuit UTC) : le jour `jour` du mois qui suit la fin de la période */
export function echeance(periode: string, jour: number): Date | null {
  const j = Math.min(Math.max(Math.round(jour) || 1, 1), 28)
  const mois = /^(\d{4})-(\d{2})$/.exec(periode)
  if (mois) return new Date(Date.UTC(Number(mois[1]), Number(mois[2]), j))
  const trimestre = /^(\d{4})-T([1-4])$/.exec(periode)
  if (trimestre) return new Date(Date.UTC(Number(trimestre[1]), Number(trimestre[2]) * 3, j))
  return null
}

/** Jours entiers restants avant la date limite (0 le jour même, négatif en retard) */
export const joursRestants = (limite: Date, maintenant = new Date()) =>
  Math.round((limite.getTime() - Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate())) / 86_400_000)
