import type { Metadata } from 'next'

import { EnTetePage, Vide } from '@/components/Blocs'
import { Icone } from '@/components/ui/Icone'
import { dico, type Langue } from '@/i18n'
import { getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.documents }
}

const taille = (octets?: number | null) => (octets ? `${(octets / 1024 / 1024).toFixed(1)} Mo` : '')

export default async function Documents({ params }: Props) {
  const { lang } = await params
  const d = dico(lang)
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'documents', limit: 200, ...loc(lang) })
  return (
    <>
      <EnTetePage surtitre={d.documents.surtitre} titre={d.documents.titre} intro={d.documents.intro} />
      <section className="section">
        <div className="conteneur conteneur--texte">
          {docs.length ? (
            <ul className="documents">
              {docs.map((doc, i) => (
                <li key={doc.id} className="document" data-reveal style={{ ['--i' as string]: i % 3 }}>
                  <span className="document__icone">
                    <Icone nom="document" />
                  </span>
                  <div>
                    <h2>{doc.titre}</h2>
                    <p>
                      {[doc.categorie && d.documents.categories[doc.categorie], doc.annee, taille(doc.filesize)].filter(Boolean).join(' · ')}
                    </p>
                    {doc.description && <p>{doc.description}</p>}
                  </div>
                  {doc.url && (
                    <a href={doc.url} className="bouton bouton--petit" download>
                      <Icone nom="telecharger" taille={18} /> {d.documents.telecharger}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Vide>{d.documents.vide}</Vide>
          )}
        </div>
      </section>
    </>
  )
}
