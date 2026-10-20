import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Publication instantanée : dès qu'un contenu change dans /admin, le site public est régénéré
 * (toutes langues). Hors requête Next (script de seed, tests), l'appel est ignoré sans erreur.
 */
const toutRegenerer = (raison: string, logger?: { info: (m: string) => void }) => {
  try {
    revalidatePath('/[lang]', 'layout')
    revalidatePath('/sitemap.xml')
    logger?.info(`Site régénéré : ${raison}`)
  } catch {
    // Pas de contexte Next (ex. pnpm seed) : rien à régénérer
  }
}

export const revaliderApresModif: CollectionAfterChangeHook = ({ collection, doc, req, context }) => {
  if (!context.sansRegeneration) toutRegenerer(`${collection.slug} #${doc.id}`, req.payload.logger)
  return doc
}

export const revaliderApresSuppression: CollectionAfterDeleteHook = ({ collection, doc, req, context }) => {
  if (!context.sansRegeneration) toutRegenerer(`${collection.slug} #${doc.id} supprimé`, req.payload.logger)
  return doc
}

export const revaliderGlobal: GlobalAfterChangeHook = ({ global, doc, req, context }) => {
  if (!context.sansRegeneration) toutRegenerer(`global ${global.slug}`, req.payload.logger)
  return doc
}

/** À ajouter dans les `hooks` d'une collection publique */
export const hooksRegeneration = {
  afterChange: [revaliderApresModif],
  afterDelete: [revaliderApresSuppression],
}
