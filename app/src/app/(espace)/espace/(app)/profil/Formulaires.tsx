'use client'

import { useActionState } from 'react'

import { changerMotDePasse, modifierProfil, type EtatProfil } from './actions'

function Message({ etat }: { etat: EtatProfil }) {
  if (!etat) return null
  return (
    <p className={`alerte ${etat.ok ? 'alerte--ok' : 'alerte--erreur'}`} role={etat.ok ? 'status' : 'alert'}>
      {etat.message}
    </p>
  )
}

export function FormulaireProfil({ nom, fonction, telephone }: { nom: string; fonction: string; telephone: string }) {
  const [etat, action, enCours] = useActionState<EtatProfil, FormData>(modifierProfil, null)
  return (
    <form action={action} className="bloc formulaire-espace">
      <h2>Mes informations</h2>
      <div className="champ">
        <label htmlFor="nom">Nom complet</label>
        <input id="nom" name="nom" required defaultValue={nom} autoComplete="name" />
      </div>
      <div className="champ">
        <label htmlFor="fonction">Fonction</label>
        <input id="fonction" name="fonction" defaultValue={fonction} placeholder="Ex. : Chargée de communication" />
      </div>
      <div className="champ">
        <label htmlFor="telephone">Téléphone (visible par l’équipe)</label>
        <input id="telephone" name="telephone" type="tel" inputMode="tel" defaultValue={telephone} autoComplete="tel" />
      </div>
      <Message etat={etat} />
      <button type="submit" className="bouton bouton--plein" disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}

export function FormulaireMotDePasse() {
  const [etat, action, enCours] = useActionState<EtatProfil, FormData>(changerMotDePasse, null)
  return (
    <form action={action} className="bloc formulaire-espace">
      <h2>Changer mon mot de passe</h2>
      <div className="champ">
        <label htmlFor="actuel">Mot de passe actuel</label>
        <input id="actuel" name="actuel" type="password" required autoComplete="current-password" />
      </div>
      <div className="champ">
        <label htmlFor="nouveau">Nouveau mot de passe (10 caractères minimum)</label>
        <input id="nouveau" name="nouveau" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <div className="champ">
        <label htmlFor="confirmation">Nouveau mot de passe, une seconde fois</label>
        <input id="confirmation" name="confirmation" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <Message etat={etat} />
      <button type="submit" className="bouton bouton--plein" disabled={enCours}>
        {enCours ? 'Changement…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}
