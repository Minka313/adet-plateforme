import type { Metadata } from 'next'

import { EnTetePage } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { dico, type Langue } from '@/i18n'
import { getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.equipe }
}

export default async function Equipe({ params }: Props) {
  const { lang } = await params
  const d = dico(lang)
  const payload = await getPayloadClient()
  const [poles, membres] = await Promise.all([
    payload.find({ collection: 'departements', limit: 50, ...loc(lang) }),
    payload.find({ collection: 'equipe', limit: 200, depth: 1, ...loc(lang) }),
  ])

  return (
    <>
      <EnTetePage surtitre={d.equipe.surtitre} titre={d.equipe.titre} intro={d.equipe.intro} />
      <section className="section section--sable">
        <div className="conteneur">
          <ul className="poles">
            {poles.docs.map((p, i) => {
              const equipe = membres.docs.filter((m) => (typeof m.departement === 'object' ? m.departement?.id : m.departement) === p.id)
              return (
                <li key={p.id} className={`pole ${!p.sigle ? 'pole--coordination' : ''}`} data-reveal style={{ ['--i' as string]: i % 3 }}>
                  <span className="pole__sigle">{p.sigle || '★'}</span>
                  <h2>{p.nom}</h2>
                  {!!p.missions?.length && (
                    <ul className="liste-losanges">
                      {p.missions.map((m) => (
                        <li key={m.id}>{m.texte}</li>
                      ))}
                    </ul>
                  )}
                  {equipe.length > 0 && (
                    <ul className="membres">
                      {equipe.map((m) => (
                        <li key={m.id} className="membre">
                          <Picture media={m.photo} taille="vignette" className="membre__photo" sizes="52px" />
                          <div>
                            <strong>{m.nom}</strong>
                            <span>{m.fonction}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
