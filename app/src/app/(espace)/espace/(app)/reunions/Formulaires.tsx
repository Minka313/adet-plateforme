'use client'

import { useActionState, useState } from 'react'

import { enregistrerCompteRendu, planifierReunion, type EtatReunion } from './actions'

function Message({ etat }: { etat: EtatReunion }) {
  if (!etat) return null
  return (
    <p className={`alerte ${etat.ok ? 'alerte--ok' : 'alerte--erreur'}`} role={etat.ok ? 'status' : 'alert'}>
      {etat.message}
    </p>
  )
}

export function FormulaireReunion({ membres }: { membres: { id: number; nom: string }[] }) {
  const [etat, action, enCours] = useActionState<EtatReunion, FormData>(planifierReunion, null)
  const [touteLEquipe, setTouteLEquipe] = useState(true)
  return (
    <details className="bloc depliant">
      <summary>Planifier une réunion</summary>
      <form action={action} className="formulaire-espace">
        <div className="champ">
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" required maxLength={160} placeholder="Ex. : Point mensuel de l’équipe" />
        </div>
        <div className="champs-trois">
          <div className="champ">
            <label htmlFor="jour">Date</label>
            <input id="jour" name="jour" type="date" required />
          </div>
          <div className="champ">
            <label htmlFor="heure">Heure (Dakar)</label>
            <input id="heure" name="heure" type="time" required defaultValue="10:00" />
          </div>
          <div className="champ">
            <label htmlFor="duree">Durée (minutes)</label>
            <input id="duree" name="duree" type="number" min={15} max={600} step={15} defaultValue={60} />
          </div>
        </div>
        <div className="champ">
          <label htmlFor="lieu">Lieu</label>
          <input id="lieu" name="lieu" maxLength={160} placeholder="Ex. : siège, Fass Diaé" />
        </div>
        <label className="case">
          <input type="checkbox" name="visio" /> En visio (une salle privée est ouverte pour cette réunion)
        </label>
        <div className="champ">
          <label htmlFor="ordreDuJour">Ordre du jour</label>
          <textarea id="ordreDuJour" name="ordreDuJour" rows={4} maxLength={4000} placeholder={'1. …\n2. …'} />
        </div>
        <label className="case">
          <input type="checkbox" name="touteLEquipe" checked={touteLEquipe} onChange={(e) => setTouteLEquipe(e.target.checked)} /> Convier toute l’équipe
        </label>
        {!touteLEquipe && (
          <fieldset className="choix-membres">
            <legend>Participants</legend>
            {membres.map((m) => (
              <label key={m.id} className="case">
                <input type="checkbox" name="participants" value={m.id} /> {m.nom}
              </label>
            ))}
          </fieldset>
        )}
        <Message etat={etat} />
        <button type="submit" className="bouton bouton--plein" disabled={enCours}>
          {enCours ? 'Planification…' : 'Planifier et prévenir les participants'}
        </button>
      </form>
    </details>
  )
}

export function FormulaireCompteRendu({ id, texte }: { id: number; texte: string }) {
  const [etat, action, enCours] = useActionState<EtatReunion, FormData>(enregistrerCompteRendu, null)
  return (
    <form action={action} className="bloc formulaire-espace">
      <h2>Compte rendu</h2>
      <input type="hidden" name="id" value={id} />
      <div className="champ">
        <label htmlFor="compteRendu">Décisions, actions à mener, prochaines étapes</label>
        <textarea id="compteRendu" name="compteRendu" rows={10} maxLength={20000} defaultValue={texte} />
      </div>
      <Message etat={etat} />
      <button type="submit" className="bouton bouton--plein" disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Enregistrer le compte rendu'}
      </button>
    </form>
  )
}
