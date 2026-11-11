import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

/** Ouvre une notification : la marque comme lue puis mène à son lien (interne seulement) */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await utilisateurCourant()
  if (!user) redirect('/espace/connexion')
  const { id } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'notifications',
    where: { and: [{ id: { equals: Number(id) } }, { destinataire: { equals: user.id } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const notif = docs[0]
  if (!notif) redirect('/espace/notifications')
  if (!notif.lue) await payload.update({ collection: 'notifications', id: notif.id, data: { lue: true }, overrideAccess: true })
  // Jamais de redirection vers un autre site
  redirect(notif.lien && /^\/(espace|admin|fr|en)(\/|$)/.test(notif.lien) ? notif.lien : '/espace/notifications')
}
