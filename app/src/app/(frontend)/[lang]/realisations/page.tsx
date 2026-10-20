import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'

import { CarteRealisation, EnTetePage, Vide } from '@/components/Blocs'
import { AXES, axeLabel } from '@/fields/axe'
import { dico, lien, type Langue } from '@/i18n'
import { getPayloadClient, loc } from '@/lib/payload'

type Props = { params: Promise<{ lang: Langue }>; searchParams: Promise<{ axe?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.realisations }
}

export default async function Realisations({ params, searchParams }: Props) {
  const [{ lang }, { axe }] = await Promise.all([params, searchParams])
  const d = dico(lang)
  const axeValide = AXES.some((a) => a.value === axe) ? axe : undefined
  const where: Where = { _status: { equals: 'published' } }
  if (axeValide) where.axe = { equals: axeValide }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'realisations', where, limit: 100, depth: 1, ...loc(lang) })
  const base = lien(lang, '/realisations')

  return (
    <>
      <EnTetePage surtitre={d.realisations.surtitre} titre={d.realisations.titre} intro={d.realisations.intro} />
      <section className="section">
        <div className="conteneur">
          <nav className="filtres" aria-label={d.realisations.axe}>
            <Link href={base} className={!axeValide ? 'est-actif' : undefined} scroll={false}>
              {d.realisations.tous}
            </Link>
            {AXES.map((a) => (
              <Link key={a.value} href={`${base}?axe=${a.value}`} className={axeValide === a.value ? 'est-actif' : undefined} scroll={false}>
                {axeLabel(a.value, lang).split('·')[1]?.trim()}
              </Link>
            ))}
          </nav>
          {docs.length ? (
            <div className="grille-cartes">
              {docs.map((r, i) => (
                <CarteRealisation key={r.id} r={r} lang={lang} i={i % 3} />
              ))}
            </div>
          ) : (
            <Vide>{d.realisations.vide}</Vide>
          )}
        </div>
      </section>
    </>
  )
}
