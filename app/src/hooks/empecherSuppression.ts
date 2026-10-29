import { APIError, type CollectionBeforeDeleteHook, type CollectionSlug } from 'payload'

/**
 * Refuse de supprimer un contenu tant que d'autres en dépendent (une formation et ses sessions,
 * une session et ses inscriptions), avec un message clair plutôt qu'une erreur de la base.
 */
export const empecherSiLie =
  (collection: CollectionSlug, champ: string, message: string): CollectionBeforeDeleteHook =>
  async ({ id, req }) => {
    const { totalDocs } = await req.payload.count({ collection, where: { [champ]: { equals: id } }, overrideAccess: true, req })
    if (totalDocs) throw new APIError(message, 400, undefined, true)
  }
