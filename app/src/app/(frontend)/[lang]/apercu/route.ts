import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'

/** Active le mode aperçu (brouillons visibles) pour un membre connecté au back-office. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const chemin = url.searchParams.get('chemin') ?? '/'
  const sortir = url.searchParams.has('sortir')
  // N'accepte que des chemins internes du site (pas de redirection ouverte)
  const destination = /^\/(fr|en)(\/[\w\-/]*)?$/.test(chemin) ? chemin : '/'

  const draft = await draftMode()
  if (sortir) {
    draft.disable()
    redirect(destination)
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('Connectez-vous au back-office pour utiliser l’aperçu.', { status: 401 })

  draft.enable()
  redirect(destination)
}
