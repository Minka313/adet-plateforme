import type { Metadata } from 'next'

import { CarteActualite, EnTetePage, Vide } from '@/components/Blocs'
import { dico, type Langue } from '@/i18n'
import { getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.actualites }
}

export default async function Actualites({ params }: Props) {
  const { lang } = await params
  const d = dico(lang)
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'actualites',
    where: { _status: { equals: 'published' } },
    limit: 60,
    depth: 1,
    ...loc(lang),
  })
  return (
    <>
      <EnTetePage surtitre={d.actualites.surtitre} titre={d.actualites.titre} intro={d.actualites.intro} />
      <section className="section">
        <div className="conteneur">
          {docs.length ? (
            <div className="grille-cartes grille-cartes--une">
              {docs.map((a, i) => (
                <CarteActualite key={a.id} a={a} lang={lang} i={i % 3} une={i === 0 && docs.length > 2} />
              ))}
            </div>
          ) : (
            <Vide>{d.actualites.vide}</Vide>
          )}
        </div>
      </section>
    </>
  )
}
