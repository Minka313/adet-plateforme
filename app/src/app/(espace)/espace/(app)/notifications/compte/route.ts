import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

/** Nombre de notifications non lues de la personne connectée (pastille de la cloche, relue toutes les minutes) */
export async function GET() {
  const user = await utilisateurCourant()
  if (!user) return Response.json({ nonLues: 0 }, { status: 401 })
  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({
    collection: 'notifications',
    where: { and: [{ destinataire: { equals: user.id } }, { lue: { equals: false } }] },
    overrideAccess: true,
  })
  return Response.json({ nonLues: totalDocs }, { headers: { 'Cache-Control': 'no-store' } })
}
