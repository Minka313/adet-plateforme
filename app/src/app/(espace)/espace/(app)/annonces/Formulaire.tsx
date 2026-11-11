'use client'

import { useActionState, useEffect, useRef } from 'react'

import { publierAnnonce, type EtatAnnonce } from './actions'

export function FormulaireAnnonce() {
  const [etat, action, enCours] = useActionState<EtatAnnonce, FormData>(publierAnnonce, null)
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (etat?.ok) form.current?.reset()
  }, [etat])

  return (
    <form ref={form} action={action} className="bloc formulaire-espace">
      <h2>Nouvelle annonce</h2>
      <div className="champ">
        <label htmlFor="titre">Titre</label>
        <input id="titre" name="titre" required maxLength={140} placeholder="Ex. : Réunion de l’équipe vendredi à 10 h" />
      </div>
      <div className="champ">
        <label htmlFor="contenu">Texte</label>
        <textarea id="contenu" name="contenu" required rows={4} maxLength={4000} />
      </div>
      <label className="case">
        <input type="checkbox" name="epinglee" /> Épingler en tête de liste
      </label>
      {etat && (
        <p className={`alerte ${etat.ok ? 'alerte--ok' : 'alerte--erreur'}`} role={etat.ok ? 'status' : 'alert'}>
          {etat.message}
        </p>
      )}
      <button type="submit" className="bouton bouton--plein" disabled={enCours}>
        {enCours ? 'Publication…' : 'Publier l’annonce'}
      </button>
    </form>
  )
}
