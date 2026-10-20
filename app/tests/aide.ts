import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

let instance: Payload | undefined

/** Payload connecté à la base de test, vidée des contenus créés par les tests précédents. */
export const payloadTest = async (): Promise<Payload> => {
  instance ??= await getPayload({ config })
  return instance
}

export const vider = async (payload: Payload) => {
  for (const collection of ['messages', 'abonnes', 'realisations', 'actualites', 'users'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true, context: { sansRegeneration: true } })
  }
}
