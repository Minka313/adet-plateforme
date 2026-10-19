import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getAssociation = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'association', depth: 1 })
})

export const getCoordonnees = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'coordonnees' })
})
