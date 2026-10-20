import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { EnTetePage } from '@/components/Blocs'
import { Riche } from '@/components/Riche'
import { Visuel } from '@/components/ui/Visuel'
import { dico, lien, type Langue } from '@/i18n'
import { formatDate } from '@/lib/format'
import { getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue; slug: string }> }

const trouver = async (lang: Langue, slug: string) => {
  const payload = await getPayloadClient()
  const { isEnabled: apercu } = await draftMode()
  const { docs } = await payload.find({
    draft: apercu,
    collection: 'actualites',
    where: apercu ? { slug: { equals: slug } } : { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
    ...loc(lang),
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const a = await trouver(lang, slug)
  return a ? { title: a.titre, description: a.resume } : {}
}

export default async function Actualite({ params }: Props) {
  const { lang, slug } = await params
  const d = dico(lang)
  const a = await trouver(lang, slug)
  if (!a) notFound()
  return (
    <article>
      <EnTetePage
        surtitre={
          <>
            <Link href={lien(lang, '/actualites')}>{d.actualites.retour}</Link> · <time dateTime={a.date}>{formatDate(a.date, lang)}</time>
          </>
        }
        titre={a.titre}
        intro={a.resume}
      />
      {a.image && (
        <div className="conteneur conteneur--texte">
          <div className="image-principale">
            <Visuel media={a.image} taille="large" priority sizes="(max-width: 800px) 100vw, 800px" />
          </div>
        </div>
      )}
      <section className="section">
        <div className="conteneur conteneur--texte">
          <Riche data={a.contenu} />
        </div>
      </section>
    </article>
  )
}
