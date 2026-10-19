import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { LogoPartenaire } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { Riche } from '@/components/Riche'
import { axeLabel } from '@/fields/axe'
import { periode } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

const trouver = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'realisations',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await trouver((await params).slug)
  return r ? { title: r.titre, description: r.resume } : {}
}

export default async function Realisation({ params }: Props) {
  const r = await trouver((await params).slug)
  if (!r) notFound()
  const partenaires = (r.partenaires ?? []).filter((p) => typeof p === 'object')
  const galerie = (r.galerie ?? []).filter((m) => typeof m === 'object')

  return (
    <article>
      <header className="entete-page">
        <div className="conteneur">
          <p className="surtitre">
            <Link href="/realisations">Réalisations</Link>
            {r.axe && ` · ${axeLabel(r.axe)}`}
          </p>
          <h1>{r.titre}</h1>
          <p className="entete-page__intro">{r.resume}</p>
          <p className="details">{[r.lieu, periode(r.dateDebut, r.dateFin)].filter(Boolean).join(' · ')}</p>
        </div>
      </header>
      {r.image && (
        <div className="conteneur">
          <Picture media={r.image} taille="large" className="image-principale" priority sizes="(max-width: 1100px) 100vw, 1100px" />
        </div>
      )}
      {!!r.chiffres?.length && (
        <div className="conteneur">
          <ul className="chiffres chiffres--impact">
            {r.chiffres.map((c) => (
              <li key={c.id}>
                <strong>{c.valeur}</strong>
                <span>{c.libelle}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="conteneur section">
        <Riche data={r.contenu} />
      </div>
      {galerie.length > 0 && (
        <section className="section section--teinte">
          <div className="conteneur">
            <h2>En images</h2>
            <div className="galerie">
              {galerie.map((m) => (
                <Picture key={typeof m === 'object' ? m.id : m} media={m} taille="carte" sizes="(max-width: 700px) 50vw, 25vw" />
              ))}
            </div>
          </div>
        </section>
      )}
      {partenaires.length > 0 && (
        <section className="section">
          <div className="conteneur">
            <h2>Avec le soutien de</h2>
            <ul className="partenaires">
              {partenaires.map((p) => (typeof p === 'object' ? <LogoPartenaire key={p.id} p={p} /> : null))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
