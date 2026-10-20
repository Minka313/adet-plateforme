import Link from 'next/link'

import { dico, lien, type Langue } from '@/i18n'
import { telHref } from '@/lib/format'
import { getAssociation, getCoordonnees } from '@/lib/payload'

import { Newsletter } from './Newsletter'
import { Icone } from './ui/Icone'
import { Lisere, Motif } from './ui/Motif'

export async function Pied({ lang }: { lang: Langue }) {
  const d = dico(lang)
  const [asso, co] = await Promise.all([getAssociation(lang), getCoordonnees()])
  const nav = [
    { href: lien(lang, '/a-propos'), label: d.nav.association },
    { href: lien(lang, '/realisations'), label: d.nav.realisations },
    { href: lien(lang, '/actualites'), label: d.nav.actualites },
    { href: lien(lang, '/equipe'), label: d.nav.equipe },
    { href: lien(lang, '/partenaires'), label: d.nav.partenaires },
    { href: lien(lang, '/documents'), label: d.nav.documents },
    { href: lien(lang, '/contact'), label: d.nav.contact },
  ]
  return (
    <footer className="pied">
      <Lisere />
      <div className="pied__corps">
        <Motif couleur="#fff" opacite={0.035} taille={64} />
        <div className="conteneur pied__grille">
          <div className="pied__marque">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/adet-logo-blanc.png" alt="ADET" width={150} height={95} loading="lazy" />
            <p className="pied__nom">{asso.nom}</p>
            <p className="pied__tagline">{d.pied.tagline}</p>
          </div>
          <nav aria-label={d.pied.explorer}>
            <h2 className="pied__titre">{d.pied.explorer}</h2>
            <ul>
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="pied__titre">{d.pied.joindre}</h2>
            {co.adresse && (
              <p className="pied__ligne">
                <Icone nom="lieu" taille={18} />
                <span className="pre">{co.adresse}</span>
              </p>
            )}
            {co.email && (
              <p className="pied__ligne">
                <Icone nom="mail" taille={18} />
                <a href={`mailto:${co.email}`}>{co.email}</a>
              </p>
            )}
            {!!co.telephones?.length && (
              <p className="pied__ligne">
                <Icone nom="telephone" taille={18} />
                <span>
                  {co.telephones.map((t, i) => (
                    <span key={t.id}>
                      {i > 0 && ' · '}
                      <a href={telHref(t.numero)}>{t.numero}</a>
                    </span>
                  ))}
                </span>
              </p>
            )}
            {!!co.reseaux?.length && (
              <ul className="pied__reseaux">
                {co.reseaux.map((r) => (
                  <li key={r.id}>
                    <a href={r.url} rel="noopener noreferrer" target="_blank">
                      {r.reseau.charAt(0).toUpperCase() + r.reseau.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="conteneur">
          <Newsletter
            lang={lang}
            libelles={{
              titre: d.pied.newsletterTitre,
              texte: d.pied.newsletterTexte,
              placeholder: d.pied.newsletterPlaceholder,
              bouton: d.pied.newsletterBouton,
              mentions: d.pied.newsletterMentions,
            }}
          />
        </div>
        <div className="conteneur pied__legal">
          <span>
            © {new Date().getFullYear()} ADET
            {co.recepisse && ` · ${d.pied.reconnue} ${co.recepisse}`}
            {co.ninea && ` · NINEA ${co.ninea}`}
          </span>
          <span className="pied__liens-legaux">
            <Link href={lien(lang, '/mentions-legales')}>{d.pied.mentions}</Link>
            <Link href="/admin">{d.pied.espaceMembres}</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
