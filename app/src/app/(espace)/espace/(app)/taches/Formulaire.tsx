'use client'

import { useActionState, useEffect, useRef } from 'react'

import { creerTache, type EtatTache } from './actions'

type Option = { id: number; nom: string }

export function FormulaireTache({ membres, poles, moi, monPole }: { membres: Option[]; poles: Option[]; moi: number; monPole?: number | null }) {
  const [etat, action, enCours] = useActionState<EtatTache, FormData>(creerTache, null)
  const form = useRef<HTMLFormElement>(null)
  const details = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (etat?.ok) {
      form.current?.reset()
      if (details.current) details.current.open = false
    }
  }, [etat])

  return (
    <details ref={details} className="bloc depliant">
      <summary>Nouvelle tâche</summary>
      <form ref={form} action={action} className="formulaire-espace">
        <div className="champ">
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" required maxLength={160} placeholder="Ex. : Préparer la liste des participants" />
        </div>
        <div className="champ">
          <label htmlFor="description">Détails (facultatif)</label>
          <textarea id="description" name="description" rows={3} maxLength={4000} />
        </div>
        <div className="champs-trois">
          <div className="champ">
            <label htmlFor="echeance">Échéance</label>
            <input id="echeance" name="echeance" type="date" />
          </div>
          <div className="champ">
            <label htmlFor="priorite">Priorité</label>
            <select id="priorite" name="priorite" defaultValue="normale">
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
            </select>
          </div>
          <div className="champ">
            <label htmlFor="pole">Pôle</label>
            <select id="pole" name="pole" defaultValue={monPole ?? ''}>
              <option value="">Aucun</option>
              {poles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <fieldset className="choix-membres">
          <legend>Responsables</legend>
          {membres.map((m) => (
            <label key={m.id} className="case">
              <input type="checkbox" name="responsables" value={m.id} defaultChecked={m.id === moi} /> {m.nom}
            </label>
          ))}
        </fieldset>
        {etat && (
          <p className={`alerte ${etat.ok ? 'alerte--ok' : 'alerte--erreur'}`} role={etat.ok ? 'status' : 'alert'}>
            {etat.message}
          </p>
        )}
        <button type="submit" className="bouton bouton--plein" disabled={enCours}>
          {enCours ? 'Création…' : 'Créer la tâche'}
        </button>
      </form>
    </details>
  )
}
