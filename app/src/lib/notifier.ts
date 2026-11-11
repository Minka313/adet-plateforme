import type { Payload } from 'payload'
import webpush from 'web-push'

import type { Role } from '../access'
import type { Notification } from '../payload-types'

type Envoi = {
  destinataires: (number | null | undefined)[]
  titre: string
  texte?: string
  lien?: string
  type: Notification['type']
}

const VAPID = {
  publique: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privee: process.env.VAPID_PRIVATE_KEY,
  sujet: process.env.VAPID_SUBJECT || 'mailto:adetsenegal1@gmail.com',
}

/** Le push n'est actif que si les clés VAPID sont configurées ; le centre de notifications marche toujours */
export const pushActif = () => Boolean(VAPID.publique && VAPID.privee)

/** Comptes actifs ayant l'un des rôles donnés (ex. ceux qui traitent les messages) */
export async function idsParRoles(payload: Payload, roles: Role[]): Promise<number[]> {
  const { docs } = await payload.find({
    collection: 'users',
    where: { and: [{ roles: { in: roles } }, { actif: { not_equals: false } }] },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  return docs.map((u) => u.id)
}

/** Tous les comptes actifs de l'équipe */
export async function idsEquipe(payload: Payload): Promise<number[]> {
  const { docs } = await payload.find({ collection: 'users', where: { actif: { not_equals: false } }, limit: 500, depth: 0, overrideAccess: true })
  return docs.map((u) => u.id)
}

/**
 * Notifie des membres de l'équipe : une ligne dans leur centre de notifications (la cloche)
 * et, si leurs appareils sont abonnés, une notification sur le téléphone même application fermée.
 * Ne lève jamais d'erreur : une notification ratée ne doit pas faire échouer l'action qui l'a déclenchée.
 */
export async function notifier(payload: Payload, { destinataires, titre, texte, lien, type }: Envoi): Promise<void> {
  const ids = [...new Set(destinataires.filter((id): id is number => typeof id === 'number'))]
  if (!ids.length) return
  try {
    await Promise.all(
      ids.map((destinataire) =>
        payload.create({ collection: 'notifications', data: { destinataire, titre, texte, lien, type, lue: false }, overrideAccess: true, depth: 0 }),
      ),
    )
  } catch (e) {
    payload.logger.error({ err: e }, 'Création des notifications impossible')
    return
  }
  if (!pushActif()) return

  try {
    webpush.setVapidDetails(VAPID.sujet, VAPID.publique!, VAPID.privee!)
    const { docs: abonnements } = await payload.find({
      collection: 'abonnements-push',
      where: { utilisateur: { in: ids } },
      limit: 2000,
      depth: 0,
      overrideAccess: true,
    })
    const message = JSON.stringify({ titre, texte: texte ?? '', lien: lien ?? '/espace/notifications' })
    await Promise.all(
      abonnements.map(async (a) => {
        try {
          await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, message, { TTL: 24 * 3600 })
        } catch (e) {
          const statut = (e as { statusCode?: number }).statusCode
          // Appareil désabonné ou abonnement expiré : on l'oublie
          if (statut === 404 || statut === 410) await payload.delete({ collection: 'abonnements-push', id: a.id, overrideAccess: true })
          else payload.logger.warn({ err: e }, 'Notification push non délivrée')
        }
      }),
    )
  } catch (e) {
    payload.logger.error({ err: e }, 'Envoi des notifications push impossible')
  }
}
