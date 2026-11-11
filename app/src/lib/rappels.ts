import type { Payload } from 'payload'

import { idsEquipe, notifier } from './notifier'

const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null | undefined))

/** Qui est convié : toute l'équipe active, ou la liste choisie */
export async function convies(payload: Parameters<typeof idsEquipe>[0], r: { touteLEquipe?: boolean | null; participants?: unknown }) {
  if (r.touteLEquipe) return idsEquipe(payload)
  return Array.isArray(r.participants) ? r.participants.map(id).filter((x): x is number => typeof x === 'number') : []
}

export const heureDakar = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }).format(new Date(iso))

/** Une réunion reste « à venir » jusqu'à trois heures après son début */
export const seuilAVenir = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString()

/** Bornes (UTC) de la journée de Dakar contenant `date` décalée de `jours` ; Dakar est à UTC+0 toute l'année */
const journee = (date: Date, jours: number) => {
  const debut = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + jours))
  return { debut: debut.toISOString(), fin: new Date(debut.getTime() + 24 * 3600 * 1000).toISOString() }
}

/**
 * Rappels des réunions, lancés chaque matin : réunions du jour et du lendemain.
 * Chaque rappel n'est envoyé qu'une fois (cases rappelJour / rappelVeille).
 */
export async function envoyerRappels(payload: Payload, maintenant = new Date()): Promise<{ jour: number; veille: number }> {
  const bilan = { jour: 0, veille: 0 }
  for (const [champ, decalage, prefixe] of [
    ['rappelJour', 0, 'Aujourd’hui'],
    ['rappelVeille', 1, 'Demain'],
  ] as const) {
    const { debut, fin } = journee(maintenant, decalage)
    const { docs } = await payload.find({
      collection: 'reunions',
      where: { and: [{ debut: { greater_than_equal: debut } }, { debut: { less_than: fin } }, { [champ]: { not_equals: true } }] },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    for (const r of docs) {
      // Une réunion du jour déjà en cours ou passée ne reçoit plus de rappel
      if (decalage === 0 && new Date(r.debut) <= maintenant) continue
      await notifier(payload, {
        destinataires: await convies(payload, r),
        titre: `${prefixe} : ${r.titre}`,
        texte: `${heureDakar(r.debut)}${r.lieu ? ` · ${r.lieu}` : ''}`,
        lien: `/espace/reunions/${r.id}`,
        type: 'reunion',
      })
      await payload.update({ collection: 'reunions', id: r.id, data: { [champ]: true }, overrideAccess: true, context: { sansRegeneration: true } })
      bilan[decalage === 0 ? 'jour' : 'veille']++
    }
  }
  return bilan
}
