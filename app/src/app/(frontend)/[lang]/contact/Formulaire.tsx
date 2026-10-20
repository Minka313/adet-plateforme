'use client'

import { useActionState } from 'react'

import type { Dictionnaire } from '@/i18n/fr'
import type { Langue } from '@/i18n/config'

import { envoyerMessage, type EtatFormulaire } from './actions'

export function Formulaire({ lang, t, objetInitial }: { lang: Langue; t: Dictionnaire['contact']; objetInitial?: string }) {
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(envoyerMessage, null)

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
      <div className="champs-ligne">
        <div className="champ">
          <label htmlFor="nom">{t.nom} *</label>
          <input id="nom" name="nom" required autoComplete="name" />
        </div>
        <div className="champ">
          <label htmlFor="organisation">{t.organisation}</label>
          <input id="organisation" name="organisation" autoComplete="organization" />
        </div>
      </div>
      <div className="champs-ligne">
        <div className="champ">
          <label htmlFor="email">{t.email}</label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <div className="champ">
          <label htmlFor="telephone">{t.telephone}</label>
          <input id="telephone" name="telephone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="champ">
        <label htmlFor="objet">{t.objet}</label>
        <select id="objet" name="objet" defaultValue={objetInitial && objetInitial in t.objets ? objetInitial : 'information'}>
          {Object.entries(t.objets).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      </div>
      <div className="champ">
        <label htmlFor="message">{t.message} *</label>
        <textarea id="message" name="message" rows={6} required />
      </div>
      <div className="champ-piege" aria-hidden="true">
        <label htmlFor="site">Site</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>
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
