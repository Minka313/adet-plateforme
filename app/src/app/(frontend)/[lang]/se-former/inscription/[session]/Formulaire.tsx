'use client'

import { useActionState } from 'react'

import type { Dictionnaire } from '@/i18n/fr'
import type { Langue } from '@/i18n/config'

import { inscrireSession, type EtatInscription } from './actions'

export function FormulaireInscription({ lang, session, t }: { lang: Langue; session: number; t: Dictionnaire['inscription'] }) {
  const [etat, action, enCours] = useActionState<EtatInscription, FormData>(inscrireSession, null)

  if (etat?.ok) {
    return (
      <div className="formulaire">
        <p className="alerte alerte--ok" role="status">
          {etat.message}
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="formulaire">
      <input type="hidden" name="langue" value={lang} />
      <input type="hidden" name="session" value={session} />
      <p className="formulaire__intro">{t.intro}</p>
      <div className="champs-ligne">
        <div className="champ">
          <label htmlFor="nom">{t.nom} *</label>
          <input id="nom" name="nom" required autoComplete="name" />
        </div>
        <div className="champ">
          <label htmlFor="telephone">{t.telephone} *</label>
          <input id="telephone" name="telephone" type="tel" required autoComplete="tel" inputMode="tel" />
        </div>
      </div>
      <div className="champs-ligne">
        <div className="champ">
          <label htmlFor="commune">{t.commune}</label>
          <input id="commune" name="commune" autoComplete="address-level2" />
        </div>
        <div className="champ">
          <label htmlFor="email">{t.email}</label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>
      </div>
      <div className="champs-ligne">
        <div className="champ">
          <label htmlFor="sexe">{t.sexe}</label>
          <select id="sexe" name="sexe" defaultValue="">
            <option value="">{t.sexeVide}</option>
            <option value="femme">{t.femme}</option>
            <option value="homme">{t.homme}</option>
          </select>
        </div>
        <div className="champ">
          <label htmlFor="age">{t.age}</label>
          <input id="age" name="age" type="number" min={10} max={100} inputMode="numeric" />
        </div>
      </div>
      <div className="champ">
        <label htmlFor="motivation">{t.motivation}</label>
        <textarea id="motivation" name="motivation" rows={4} />
      </div>
      <div className="champ-piege" aria-hidden="true">
        <label htmlFor="site">Site</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="formulaire__note">{t.donnees}</p>
      {etat && !etat.ok && (
        <p className="alerte alerte--erreur" role="alert">
          {etat.message}
        </p>
      )}
      <button type="submit" className="bouton bouton--grand" disabled={enCours}>
        {enCours ? t.envoi : t.envoyer}
      </button>
    </form>
  )
}
