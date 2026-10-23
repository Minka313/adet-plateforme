import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { EnTetePage, LogoPartenaire, TitreSection } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { Riche } from '@/components/Riche'
import { Icone } from '@/components/ui/Icone'
import { Visuel } from '@/components/ui/Visuel'
import { axeLabel } from '@/fields/axe'
import { dico, lien, type Langue } from '@/i18n'
import { periode } from '@/lib/format'
import { getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue; slug: string }> }

const trouver = async (lang: Langue, slug: string) => {
  const payload = await getPayloadClient()
  const { isEnabled: apercu } = await draftMode()
  const { docs } = await payload.find({
    draft: apercu,
    collection: 'realisations',
    where: apercu ? { slug: { equals: slug } } : { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 2,
    ...loc(lang),
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const r = await trouver(lang, slug)
  return r ? { title: r.titre, description: r.resume } : {}
}

export default async function Realisation({ params }: Props) {
  const { lang, slug } = await params
  const d = dico(lang)
  const r = await trouver(lang, slug)
  if (!r) notFound()
  const partenaires = (r.partenaires ?? []).flatMap((p) => (typeof p === 'object' ? [p] : []))
  const galerie = (r.galerie ?? []).flatMap((m) => (typeof m === 'object' ? [m] : []))

  return (
    <article>
      <EnTetePage
        surtitre={
          <>
            <Link href={lien(lang, '/realisations')}>{d.realisations.retour}</Link>
            {r.statut && ` · ${d.realisations.statut[r.statut]}`}
          </>
        }
        titre={r.titre}
        intro={r.resume}
      />
      <div className="conteneur">
        <div className="image-principale">
          <Visuel media={r.image} axe={r.axe} taille="large" priority sizes="(max-width: 1200px) 100vw, 1200px" />
          {r.image && typeof r.image === 'object' && r.image.credit && <span className="photo-site__credit">{r.image.credit}</span>}
        </div>
      </div>

      <section className="section">
        <div className="conteneur fiche">
          <div>
            {!!r.chiffres?.length && (
              <ul className="impact" aria-label={d.realisations.impact}>
                {r.chiffres.map((c, i) => (
                  <li key={c.id} data-reveal style={{ ['--i' as string]: i }}>
                    <strong data-compte={c.valeur}>{c.valeur}</strong>
                    {c.libelle}
                  </li>
                ))}
              </ul>
            )}
            <Riche data={r.contenu} />
          </div>
          <aside className="fiche__aside">
            <dl className="fiche__bloc">
              {r.axe && (
                <>
                  <dt>{d.realisations.axe}</dt>
                  <dd>{axeLabel(r.axe, lang)}</dd>
                </>
              )}
              {r.lieu && (
                <>
                  <dt>{d.realisations.lieu}</dt>
                  <dd>{r.lieu}</dd>
                </>
              )}
              {(r.dateDebut || r.dateFin) && (
                <>
                  <dt>{d.realisations.periode}</dt>
                  <dd>{periode(r.dateDebut, r.dateFin, lang)}</dd>
                </>
              )}
            </dl>
            <Link href={lien(lang, '/contact?objet=partenariat')} className="bouton bouton--or">
              {d.accueil.devenirPartenaire} <Icone nom="fleche" taille={18} />
            </Link>
          </aside>
        </div>
      </section>

      {galerie.length > 0 && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={d.realisations.enImages} />
            <div className="galerie">
              {galerie.map((m) => (
                <a key={m.id} href={m.url ?? '#'} target="_blank" rel="noopener noreferrer">
                  <Picture media={m} taille="carte" sizes="(max-width: 700px) 50vw, 25vw" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {partenaires.length > 0 && (
        <section className="section section--court">
          <div className="conteneur">
            <TitreSection titre={d.realisations.soutien} />
            <ul className="defilant__piste" style={{ animation: 'none', flexWrap: 'wrap' }}>
              {partenaires.map((p) => (
                <LogoPartenaire key={p.id} p={p} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
