import Link from 'next/link'

import { telHref } from '@/lib/format'
import { getAssociation, getCoordonnees } from '@/lib/payload'

import { NAVIGATION } from './navigation'

export async function Footer() {
  const [asso, co] = await Promise.all([getAssociation(), getCoordonnees()])
  return (
    <footer className="pied">
      <div className="conteneur pied__grille">
        <div>
          <div className="pied__marque">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/adet-symbole.svg" alt="" width={40} height={64} />
            <strong>{asso.sigle}</strong>
          </div>
          <p className="pied__nom">{asso.nom}</p>
          {asso.accroche && <p className="pied__accroche">{asso.accroche}</p>}
        </div>
        <nav aria-label="Pied de page">
          <h2 className="pied__titre">Explorer</h2>
          <ul>
            {NAVIGATION.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="pied__titre">Nous joindre</h2>
          {co.adresse && <p className="pied__adresse">{co.adresse}</p>}
          <ul>
            {co.email && (
              <li>
                <a href={`mailto:${co.email}`}>{co.email}</a>
              </li>
            )}
            {co.telephones?.map((t) => (
              <li key={t.id}>
                <a href={telHref(t.numero)}>{t.numero}</a>
              </li>
            ))}
            {co.reseaux?.map((r) => (
              <li key={r.id}>
                <a href={r.url} rel="noopener noreferrer" target="_blank">
                  {r.reseau.charAt(0).toUpperCase() + r.reseau.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="conteneur pied__legal">
        <span>
          © {new Date().getFullYear()} {asso.sigle}
          {co.recepisse && ` · Reconnue sous le n° ${co.recepisse}`}
          {co.ninea && ` · NINEA ${co.ninea}`}
        </span>
        <Link href="/admin">Espace membres</Link>
      </div>
    </footer>
  )
}
