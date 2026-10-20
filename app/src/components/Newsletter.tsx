'use client'

import { useActionState } from 'react'

import { inscrireNewsletter, type EtatNewsletter } from '@/app/actions/newsletter'
import type { Langue } from '@/i18n/config'

export function Newsletter({ lang, libelles }: { lang: Langue; libelles: { titre: string; texte: string; placeholder: string; bouton: string; mentions: string } }) {
  const [etat, action, enCours] = useActionState<EtatNewsletter, FormData>(inscrireNewsletter, null)
  return (
    <div className="newsletter">
      <h2 className="pied__titre">{libelles.titre}</h2>
      <p>{libelles.texte}</p>
      {etat?.ok ? (
        <p className="newsletter__ok" role="status">
          {etat.message}
        </p>
      ) : (
        <form action={action} className="newsletter__form">
          <input type="hidden" name="langue" value={lang} />
          <label htmlFor="newsletter-email" className="visuellement-cache">
            {libelles.placeholder}
          </label>
          <input id="newsletter-email" name="email" type="email" required placeholder={libelles.placeholder} autoComplete="email" />
          <input name="site" tabIndex={-1} autoComplete="off" className="champ-piege" aria-hidden="true" />
          <button type="submit" className="bouton bouton--or bouton--petit" disabled={enCours}>
            {libelles.bouton}
          </button>
        </form>
      )}
      {etat && !etat.ok && (
        <p className="newsletter__erreur" role="alert">
          {etat.message}
        </p>
      )}
      <p className="newsletter__mentions">{libelles.mentions}</p>
    </div>
  )
}
