import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Picture } from '@/components/Picture'
import { Riche } from '@/components/Riche'
import { formatDate } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

const trouver = async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'actualites',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await trouver((await params).slug)
  return a ? { title: a.titre, description: a.resume } : {}
}

export default async function Actualite({ params }: Props) {
  const a = await trouver((await params).slug)
  if (!a) notFound()
  return (
    <article>
      <header className="entete-page">
        <div className="conteneur conteneur--texte">
          <p className="surtitre">
            <Link href="/actualites">Actualités</Link> · <time dateTime={a.date}>{formatDate(a.date)}</time>
          </p>
          <h1>{a.titre}</h1>
          <p className="entete-page__intro">{a.resume}</p>
        </div>
      </header>
      {a.image && (
        <div className="conteneur conteneur--texte">
          <Picture media={a.image} taille="large" className="image-principale" priority sizes="(max-width: 760px) 100vw, 760px" />
        </div>
      )}
      <div className="conteneur conteneur--texte section">
        <Riche data={a.contenu} />
      </div>
    </article>
  )
}
