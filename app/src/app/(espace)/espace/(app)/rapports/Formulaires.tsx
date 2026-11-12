'use client'

import { useActionState, useState } from 'react'

import { deciderRapport, enregistrerModele, enregistrerRapport, type Etat } from './actions'

function Message({ etat }: { etat: Etat }) {
  if (!etat) return null
  return (
    <p className={`alerte ${etat.ok ? 'alerte--ok' : 'alerte--erreur'}`} role={etat.ok ? 'status' : 'alert'}>
      {etat.message}
    </p>
  )
}

type Section = { intitule: string; aide?: string | null; obligatoire?: boolean | null }

/** Rédaction d'un rapport : une zone de texte par rubrique du modèle */
export function FormulaireRapport({
  id,
  modele,
  periode,
  sections,
  valeurs,
  periodeLibre,
}: {
  id?: number
  modele: number
  periode?: string
  sections: Section[]
  valeurs?: Record<string, string>
  periodeLibre?: boolean
}) {
  const [etat, action, enCours] = useActionState<Etat, FormData>(enregistrerRapport, null)
  return (
    <form action={action} className="bloc formulaire-espace">
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="modele" value={modele} />
      {periodeLibre ? (
        <div className="champ">
          <label htmlFor="periode">Activité concernée</label>
          <input id="periode" name="periode" required maxLength={120} placeholder="Ex. : Formation en gestion, Vélingara, 26-28 novembre" />
        </div>
      ) : (
        periode && !id && <input type="hidden" name="periode" value={periode} />
      )}
      {sections.map((s, i) => (
        <div key={`${s.intitule}-${i}`} className="champ">
          <input type="hidden" name="intitule" value={s.intitule} />
          <input type="hidden" name="obligatoire" value={s.obligatoire ? 'oui' : 'non'} />
          <label htmlFor={`valeur-${i}`}>
            {s.intitule}
            {s.obligatoire ? ' *' : ''}
          </label>
          {s.aide && <span className="champ__aide">{s.aide}</span>}
          <textarea id={`valeur-${i}`} name="valeur" rows={5} maxLength={10000} defaultValue={valeurs?.[s.intitule] ?? ''} />
        </div>
      ))}
      <Message etat={etat} />
      <div className="boutons">
        <button type="submit" name="intention" value="brouillon" className="bouton bouton--clair" disabled={enCours}>
          Enregistrer le brouillon
        </button>
        <button type="submit" name="intention" value="soumettre" className="bouton bouton--plein" disabled={enCours}>
          {enCours ? 'Envoi…' : 'Soumettre pour validation'}
        </button>
      </div>
    </form>
  )
}

/** Décision du validateur */
export function FormulaireDecision({ id }: { id: number }) {
  const [etat, action, enCours] = useActionState<Etat, FormData>(deciderRapport, null)
  if (etat?.ok) return <Message etat={etat} />
  return (
    <form action={action} className="bloc formulaire-espace">
      <h2>Votre décision</h2>
      <input type="hidden" name="id" value={id} />
      <div className="champ">
        <label htmlFor="commentaire">Commentaire (obligatoire pour demander une correction)</label>
        <textarea id="commentaire" name="commentaire" rows={3} maxLength={4000} />
      </div>
      <Message etat={etat} />
      <div className="boutons">
        <button type="submit" name="decision" value="corriger" className="bouton bouton--clair" disabled={enCours}>
          Demander une correction
        </button>
        <button type="submit" name="decision" value="valider" className="bouton bouton--plein" disabled={enCours}>
          Valider le rapport
        </button>
      </div>
    </form>
  )
}

type Choix = { id: number | string; nom: string }

/** Le directeur règle un modèle : rubriques, rythme, qui rend, qui valide */
export function EditeurModele({
  modele,
  roles,
  poles,
  membres,
}: {
  modele?: {
    id: number
    titre: string
    description?: string | null
    periodicite: string
    jourLimite?: number | null
    actif?: boolean | null
    sections: Section[]
    rolesAuteurs: string[]
    polesAuteurs: number[]
    personnesAuteurs: number[]
    validateurs: number[]
  }
  roles: Choix[]
  poles: Choix[]
  membres: Choix[]
}) {
  const [etat, action, enCours] = useActionState<Etat, FormData>(enregistrerModele, null)
  const [sections, setSections] = useState<Section[]>(modele?.sections.length ? modele.sections : [{ intitule: '', aide: '', obligatoire: true }])
  const changer = (i: number, s: Partial<Section>) => setSections((l) => l.map((x, j) => (j === i ? { ...x, ...s } : x)))
  const deplacer = (i: number, d: number) =>
    setSections((l) => {
      const copie = [...l]
      const [x] = copie.splice(i, 1)
      copie.splice(i + d, 0, x)
      return copie
    })

  const cases = (nom: string, liste: Choix[], coches: (number | string)[] = []) => (
    <div className="choix-membres choix-membres--ouvert">
      {liste.map((c) => (
        <label key={c.id} className="case">
          <input type="checkbox" name={nom} value={c.id} defaultChecked={coches.includes(c.id)} /> {c.nom}
        </label>
      ))}
    </div>
  )

  return (
    <form action={action} className="pile">
      {modele && <input type="hidden" name="id" value={modele.id} />}
      <section className="bloc formulaire-espace">
        <h2>Le rapport</h2>
        <div className="champ">
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" required maxLength={120} defaultValue={modele?.titre} placeholder="Ex. : Rapport mensuel de pôle" />
        </div>
        <div className="champ">
          <label htmlFor="description">À quoi il sert (affiché à l’équipe)</label>
          <textarea id="description" name="description" rows={2} maxLength={600} defaultValue={modele?.description ?? ''} />
        </div>
        <div className="champs-trois">
          <div className="champ">
            <label htmlFor="periodicite">Rythme</label>
            <select id="periodicite" name="periodicite" defaultValue={modele?.periodicite ?? 'mensuel'}>
              <option value="mensuel">Chaque mois</option>
              <option value="trimestriel">Chaque trimestre</option>
              <option value="ponctuel">Après chaque activité</option>
            </select>
          </div>
          <div className="champ">
            <label htmlFor="jourLimite">Jour limite du mois suivant</label>
            <input id="jourLimite" name="jourLimite" type="number" min={1} max={28} defaultValue={modele?.jourLimite ?? 5} />
          </div>
          <label className="case case--champ">
            <input type="checkbox" name="actif" defaultChecked={modele?.actif ?? true} /> Demandé à l’équipe
          </label>
        </div>
      </section>

      <section className="bloc formulaire-espace">
        <h2>Les rubriques</h2>
        <ol className="rubriques">
          {sections.map((s, i) => (
            <li key={i} className="rubrique">
              <div className="champ">
                <label htmlFor={`intitule-${i}`}>Rubrique {i + 1}</label>
                <input id={`intitule-${i}`} name="intitule" value={s.intitule} onChange={(e) => changer(i, { intitule: e.target.value })} maxLength={120} required />
              </div>
              <div className="champ">
                <label htmlFor={`aide-${i}`}>Indication (facultatif)</label>
                <input id={`aide-${i}`} name="aide" value={s.aide ?? ''} onChange={(e) => changer(i, { aide: e.target.value })} maxLength={200} />
              </div>
              <input type="hidden" name="obligatoire" value={s.obligatoire ? 'oui' : 'non'} />
              <div className="rubrique__outils">
                <label className="case">
                  <input type="checkbox" checked={Boolean(s.obligatoire)} onChange={(e) => changer(i, { obligatoire: e.target.checked })} /> Obligatoire
                </label>
                <span>
                  <button type="button" className="bouton-icone" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label={`Monter la rubrique ${i + 1}`}>
                    ↑
                  </button>
                  <button type="button" className="bouton-icone" onClick={() => deplacer(i, 1)} disabled={i === sections.length - 1} aria-label={`Descendre la rubrique ${i + 1}`}>
                    ↓
                  </button>
                  <button type="button" className="bouton-icone" onClick={() => setSections((l) => l.filter((_, j) => j !== i))} disabled={sections.length === 1} aria-label={`Retirer la rubrique ${i + 1}`}>
                    ✕
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="bouton bouton--clair" onClick={() => setSections((l) => [...l, { intitule: '', aide: '', obligatoire: true }])} disabled={sections.length >= 15}>
          Ajouter une rubrique
        </button>
      </section>

      <section className="bloc formulaire-espace">
        <h2>Qui doit le rendre</h2>
        <p className="vide-espace">Cochez un ou plusieurs rôles, pôles ou personnes. Une personne est concernée si elle correspond à l’un d’eux.</p>
        <h3>Par rôle</h3>
        {cases('rolesAuteurs', roles, modele?.rolesAuteurs)}
        <h3>Par pôle</h3>
        {cases('polesAuteurs', poles, modele?.polesAuteurs)}
        <h3>Nommément</h3>
        {cases('personnesAuteurs', membres, modele?.personnesAuteurs)}
      </section>

      <section className="bloc formulaire-espace">
        <h2>Qui le valide</h2>
        <p className="vide-espace">Sans choix, le bureau valide.</p>
        {cases('validateurs', membres, modele?.validateurs)}
      </section>

      <Message etat={etat} />
      <button type="submit" className="bouton bouton--plein" disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Enregistrer le modèle'}
      </button>
    </form>
  )
}
