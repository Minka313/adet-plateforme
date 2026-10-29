import Link from 'next/link'

import type { Formation, Opportunite, Structure } from '@/payload-types'
import { dico, lien, type Langue } from '@/i18n'
import { datesSession, formatDate, placesRestantes } from '@/lib/format'
import type { SessionAffichee } from '@/lib/payload'

import { Etoiles } from './ui/Etoiles'
import { Icone } from './ui/Icone'

/** Encadré sombre pour une liste vide, avec actions (lettre d'information, contact…) */
export function EncadreVide({ titre, texte, children }: { titre: string; texte: string; children?: React.ReactNode }) {
  return (
    <div className="vide bientot" data-reveal>
      <Etoiles className="vide__etoiles" />
      <p className="bientot__titre">{titre}</p>
      <p className="bientot__texte">{texte}</p>
      {children && <div className="bientot__actions">{children}</div>}
    </div>
  )
}

export function CarteOpportunite({ o, lang, i = 0 }: { o: Opportunite; lang: Langue; i?: number }) {
  const d = dico(lang).opportunites
  const structure = o.structure && typeof o.structure === 'object' ? o.structure : null
  return (
    <article className="opportunite" data-reveal style={{ ['--i' as string]: i % 3 }}>
      <p className="opportunite__type">{d.typesOpportunite[o.type]}</p>
      <h3>{o.titre}</h3>
      <p className="opportunite__echeance">
        <Icone nom="calendrier" taille={16} /> {d.dateLimite} : <strong>{formatDate(o.dateLimite, lang)}</strong>
      </p>
      <p>{o.resume}</p>
      {o.publicCible && (
        <p className="opportunite__detail">
          <strong>{d.pourQui}</strong> {o.publicCible}
        </p>
      )}
      {structure && (
        <p className="opportunite__detail">
          <strong>{d.proposePar}</strong> {structure.sigle || structure.nom}
        </p>
      )}
      <a href={o.lien} rel="noopener noreferrer" target="_blank" className="lien-fleche">
        {d.postuler} <Icone nom="externe" taille={16} />
      </a>
    </article>
  )
}

export function CarteStructure({ s, lang, i = 0 }: { s: Structure; lang: Langue; i?: number }) {
  const d = dico(lang).opportunites
  return (
    <article className="structure" data-reveal style={{ ['--i' as string]: i % 3 }}>
      {s.sigle && <p className="structure__sigle">{s.sigle}</p>}
      <h3>{s.nom}</h3>
      <p>{s.description}</p>
      {s.aKolda && (
        <p className="structure__kolda">
          <strong>{d.aKolda} :</strong> {s.aKolda}{' '}
          {s.source && (
            <a href={s.source} rel="noopener noreferrer" target="_blank">
              ({d.source})
            </a>
          )}
        </p>
      )}
      {s.siteWeb && (
        <a href={s.siteWeb} rel="noopener noreferrer" target="_blank" className="lien-fleche">
          {d.siteWeb} <Icone nom="externe" taille={16} />
        </a>
      )}
    </article>
  )
}

export function CarteFormation({ f, sessions, lang, i = 0 }: { f: Formation; sessions: SessionAffichee[]; lang: Langue; i?: number }) {
  const d = dico(lang).formations
  const infos = [
    [d.public, f.publicCible],
    [d.duree, f.duree],
    [d.lieu, f.lieu],
    [d.cout, f.cout],
  ].filter(([, v]) => v)
  return (
    <article className="opportunite" data-reveal style={{ ['--i' as string]: i % 3 }}>
      <h3>{f.titre}</h3>
      <p>{f.resume}</p>
      {!!infos.length && (
        <dl className="formation__infos">
          {infos.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {sessions.length ? (
        <div className="sessions">
          <p className="opportunite__type">{d.sessionsTitre}</p>
          <ul>
            {sessions.map((s) => (
              <li key={s.id} className="session">
                <p className="session__quand">
                  <Icone nom="calendrier" taille={16} /> <strong>{datesSession(s.dateDebut, s.dateFin, lang)}</strong>
                  {s.lieu && <span> · {s.lieu}</span>}
                </p>
                {s.etat === 'ouverte' ? (
                  <p className="session__action">
                    {s.restantes !== null && <span className="session__places">{placesRestantes(s.restantes, d)}</span>}
                    <Link href={lien(lang, `/se-former/inscription/${s.id}`)} className="bouton bouton--or bouton--petit">
                      {d.inscrire}
                    </Link>
                  </p>
                ) : (
                  <p className="session__action">
                    <span className="session__etat">{s.etat === 'complete' ? d.complet : d.fermee}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="opportunite__type">{d.dateAVenir}</p>
      )}
    </article>
  )
}
