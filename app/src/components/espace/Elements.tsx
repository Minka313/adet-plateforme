import type { Annonce, User } from '@/payload-types'
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
