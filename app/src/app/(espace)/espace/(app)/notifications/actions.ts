'use server'

import { revalidatePath } from 'next/cache'

import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

export async function toutMarquerLu() {
  const user = await utilisateurCourant()
  if (!user) return
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'notifications',
    where: { and: [{ destinataire: { equals: user.id } }, { lue: { equals: false } }] },
    data: { lue: true },
    overrideAccess: true,
  })
  revalidatePath('/espace', 'layout')
}
