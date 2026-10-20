import { draftMode } from 'next/headers'

import type { Langue } from '@/i18n/config'

/** Bandeau visible uniquement en mode aperçu, pour ne jamais confondre brouillon et version publiée. */
export async function BandeauApercu({ lang }: { lang: Langue }) {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null
  return (
    <div className="bandeau-apercu" role="status">
      <span>{lang === 'fr' ? 'Mode aperçu : les brouillons sont visibles.' : 'Preview mode: drafts are visible.'}</span>
      <a href={`/${lang}/apercu?sortir&chemin=/${lang}`}>{lang === 'fr' ? 'Quitter l’aperçu' : 'Exit preview'}</a>
    </div>
  )
}
