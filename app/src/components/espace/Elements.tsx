import Link from 'next/link'

import { changerStatut } from '@/app/(espace)/espace/(app)/taches/actions'
import type { Annonce, Rapport, Reunion, Tache, User } from '@/payload-types'
import { initiales } from '@/lib/session'

import { IconeEspace } from './Icones'

const dateCourte = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' }).format(new Date(iso))

export function CarteAnnonce({ a }: { a: Annonce }) {
  const auteur = a.auteur && typeof a.auteur === 'object' ? a.auteur : null
  return (
    <article className={`annonce ${a.epinglee ? 'annonce--epinglee' : ''}`}>
      <header>
        {a.epinglee && (
          <span className="annonce__epingle">
            <IconeEspace nom="epingle" taille={16} /> Épinglée
          </span>
        )}
        <h3>{a.titre}</h3>
        <p className="annonce__meta">
          {auteur?.nom ?? 'Le bureau'} · {dateCourte(a.createdAt)}
        </p>
      </header>
      <p className="annonce__texte">{a.contenu}</p>
    </article>
  )
}

/** Numéro sénégalais au format international pour tel: et wa.me (« 77 458 61 05 » → 221774586105) */
export const numeroInternational = (numero: string) => {
  const chiffres = numero.replace(/\D/g, '')
  return chiffres.startsWith('221') ? chiffres : `221${chiffres}`
}

export function CarteMembre({ m, pole }: { m: User; pole?: string | null }) {
  return (
    <li className="membre">
      <span className="avatar avatar--grand" aria-hidden="true">
        {initiales(m)}
      </span>
      <div className="membre__texte">
        <p className="membre__nom">{m.nom ?? m.email}</p>
        <p className="membre__fonction">{[m.fonction, pole].filter(Boolean).join(' · ') || 'Équipe ADET'}</p>
      </div>
      {m.telephone && (
        <div className="membre__actions">
          <a href={`tel:+${numeroInternational(m.telephone)}`} className="bouton-icone" aria-label={`Appeler ${m.nom ?? ''}`} title={m.telephone}>
            <IconeEspace nom="telephone" />
          </a>
          <a
            href={`https://wa.me/${numeroInternational(m.telephone)}`}
            className="bouton-icone bouton-icone--whatsapp"
            aria-label={`Écrire à ${m.nom ?? ''} sur WhatsApp`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconeEspace nom="whatsapp" />
          </a>
        </div>
      )}
    </li>
  )
}

const ACTIONS_STATUT: Record<Tache['statut'], { statut: Tache['statut']; libelle: string; principal?: boolean }[]> = {
  'a-faire': [
    { statut: 'en-cours', libelle: 'Commencer' },
    { statut: 'fait', libelle: 'Terminer', principal: true },
  ],
  'en-cours': [{ statut: 'fait', libelle: 'Terminer', principal: true }],
  fait: [{ statut: 'a-faire', libelle: 'Rouvrir' }],
}

const aujourdhuiUTC = () => {
  const d = new Date()
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export function CarteTache({ t, modifiable }: { t: Tache; modifiable: boolean }) {
  const responsables = (t.responsables ?? []).filter((r): r is User => typeof r === 'object' && r !== null)
  const pole = t.pole && typeof t.pole === 'object' ? t.pole.nom : null
  const enRetard = t.statut !== 'fait' && t.echeance && new Date(t.echeance).getTime() < aujourdhuiUTC()
  return (
    <li className={`tache tache--${t.priorite}`}>
      <div className="tache__tete">
        <p className="tache__titre">{t.titre}</p>
        {t.priorite === 'haute' && <span className="etiquette etiquette--haute">Priorité haute</span>}
      </div>
      {t.description && <p className="tache__texte">{t.description.length > 160 ? `${t.description.slice(0, 160)}…` : t.description}</p>}
      <p className="tache__meta">
        {t.echeance && (
          <span className={enRetard ? 'tache__retard' : undefined}>
            {enRetard ? 'En retard : ' : 'Pour le '}
            {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(t.echeance))}
          </span>
        )}
        {pole && <span>{pole}</span>}
      </p>
      <div className="tache__pied">
        <span className="avatars" aria-label={responsables.length ? `Responsables : ${responsables.map((r) => r.nom ?? r.email).join(', ')}` : 'Personne assignée'}>
          {responsables.slice(0, 4).map((r) => (
            <span key={r.id} className="avatar avatar--petit" title={r.nom ?? r.email}>
              {initiales(r)}
            </span>
          ))}
        </span>
        {modifiable && (
          <span className="tache__actions">
            {ACTIONS_STATUT[t.statut].map((a) => (
              <form key={a.statut} action={changerStatut}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="statut" value={a.statut} />
                <button type="submit" className={`bouton bouton--petit ${a.principal ? 'bouton--plein' : 'bouton--clair'}`}>
                  {a.libelle}
                </button>
              </form>
            ))}
          </span>
        )}
      </div>
    </li>
  )
}

export function CarteReunion({ r }: { r: Reunion }) {
  const debut = new Date(r.debut)
  return (
    <li>
      <Link href={`/espace/reunions/${r.id}`} className="reunion">
        <span className="reunion__date" aria-hidden="true">
          <strong>{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'Africa/Dakar' }).format(debut)}</strong>
          <span>{new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'Africa/Dakar' }).format(debut)}</span>
        </span>
        <span className="reunion__texte">
          <strong>{r.titre}</strong>
          <span>
            {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dakar' }).format(debut)}
            {r.lieu ? ` · ${r.lieu}` : ''}
            {r.visio ? ' · en visio' : ''}
          </span>
        </span>
      </Link>
    </li>
  )
}

const STATUT_RAPPORT: Record<Rapport['statut'], string> = { brouillon: 'Brouillon', soumis: 'En attente de validation', 'a-corriger': 'À corriger', valide: 'Validé' }

export function PastilleStatut({ statut }: { statut: Rapport['statut'] }) {
  return <span className={`statut statut--${statut}`}>{STATUT_RAPPORT[statut]}</span>
}
