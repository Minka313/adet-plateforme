'use client'

import { useActionState } from 'react'

import { envoyerMessage, type EtatFormulaire } from './actions'

const OBJETS = [
  { value: 'information', label: "Demande d'information" },
  { value: 'partenariat', label: 'Devenir partenaire' },
  { value: 'adhesion', label: 'Adhérer / bénévolat' },
  { value: 'formation', label: 'Formations' },
  { value: 'autre', label: 'Autre' },
]

export function Formulaire({ objetInitial }: { objetInitial?: string }) {
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(envoyerMessage, null)

  if (etat?.ok) {
    return (
      <p className="alerte alerte--ok" role="status">
        {etat.message}
      </p>
    )
  }

  return (
    <form action={action} className="formulaire">
      <div className="champ">
        <label htmlFor="nom">Nom et prénom *</label>
        <input id="nom" name="nom" required autoComplete="name" />
      </div>
      <div className="champs-ligne">
        <div className="champ">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <div className="champ">
          <label htmlFor="telephone">Téléphone / WhatsApp</label>
          <input id="telephone" name="telephone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="champ">
        <label htmlFor="objet">Objet</label>
        <select id="objet" name="objet" defaultValue={objetInitial ?? 'information'}>
          {OBJETS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="champ">
        <label htmlFor="message">Message *</label>
        <textarea id="message" name="message" rows={6} required />
      </div>
      <div className="champ-piege" aria-hidden="true">
        <label htmlFor="site">Ne pas remplir</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>
      {etat && !etat.ok && (
        <p className="alerte alerte--erreur" role="alert">
          {etat.message}
        </p>
      )}
      <button type="submit" className="bouton" disabled={enCours}>
        {enCours ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  )
}
