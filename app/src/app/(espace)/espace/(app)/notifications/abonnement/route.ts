import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

type Abonnement = { endpoint?: string; keys?: { p256dh?: string; auth?: string } }

/** Décrit l'appareil en quelques mots, à partir du navigateur (« Chrome · Android ») */
const appareil = (agent: string) => {
  const navigateur = /Edg\//.test(agent) ? 'Edge' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : 'Navigateur'
  const systeme = /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iPhone / iPad' : /Windows/.test(agent) ? 'Windows' : /Mac OS/.test(agent) ? 'Mac' : /Linux/.test(agent) ? 'Linux' : ''
  return [navigateur, systeme].filter(Boolean).join(' · ')
}

/** Active les notifications sur cet appareil (un abonnement par appareil, rattaché à la personne connectée) */
export async function POST(request: Request) {
  const user = await utilisateurCourant()
  if (!user) return Response.json({ message: 'Non connecté' }, { status: 401 })
  const corps = (await request.json().catch(() => null)) as Abonnement | null
  const endpoint = corps?.endpoint
  const { p256dh, auth } = corps?.keys ?? {}
  if (!endpoint || !/^https:\/\//.test(endpoint) || !p256dh || !auth) return Response.json({ message: 'Abonnement invalide' }, { status: 400 })

  const payload = await getPayloadClient()
  const data = { utilisateur: user.id, endpoint, p256dh, auth, appareil: appareil(request.headers.get('user-agent') ?? '') }
  const { docs } = await payload.find({ collection: 'abonnements-push', where: { endpoint: { equals: endpoint } }, limit: 1, depth: 0, overrideAccess: true })
  if (docs[0]) await payload.update({ collection: 'abonnements-push', id: docs[0].id, data, overrideAccess: true })
  else await payload.create({ collection: 'abonnements-push', data, overrideAccess: true })
  return Response.json({ ok: true })
}

/** Désactive les notifications sur cet appareil */
export async function DELETE(request: Request) {
  const user = await utilisateurCourant()
  if (!user) return Response.json({ message: 'Non connecté' }, { status: 401 })
  const corps = (await request.json().catch(() => null)) as Abonnement | null
  if (!corps?.endpoint) return Response.json({ message: 'Abonnement invalide' }, { status: 400 })
  const payload = await getPayloadClient()
  await payload.delete({
    collection: 'abonnements-push',
    where: { and: [{ endpoint: { equals: corps.endpoint } }, { utilisateur: { equals: user.id } }] },
    overrideAccess: true,
  })
  return Response.json({ ok: true })
}
