import type { Metadata } from 'next'

import { EnTetePage } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60
export const metadata: Metadata = { title: "L'équipe" }

export default async function Equipe() {
  const payload = await getPayloadClient()
  const [departements, membres] = await Promise.all([
    payload.find({ collection: 'departements', limit: 50 }),
    payload.find({ collection: 'equipe', limit: 200, depth: 1 }),
  ])

  return (
    <>
      <EnTetePage
        surtitre="Équipe"
        titre="Une équipe pluridisciplinaire et engagée"
        intro="L'ADET est organisée en pôles complémentaires, qui travaillent ensemble au service du développement économique des territoires."
      />
      <section className="section">
        <div className="conteneur">
          <ul className="departements">
            {departements.docs.map((d) => {
              const equipe = membres.docs.filter(
                (m) => (typeof m.departement === 'object' ? m.departement?.id : m.departement) === d.id,
              )
              return (
                <li key={d.id} className="departement">
                  <h2>
                    {d.nom}
                    {d.sigle && <span className="departement__sigle">{d.sigle}</span>}
                  </h2>
                  {!!d.missions?.length && (
                    <ul className="liste-coches">
                      {d.missions.map((m) => (
                        <li key={m.id}>{m.texte}</li>
                      ))}
                    </ul>
                  )}
                  {equipe.length > 0 && (
                    <ul className="membres">
                      {equipe.map((m) => (
                        <li key={m.id} className="membre">
                          <Picture media={m.photo} taille="vignette" className="membre__photo" sizes="96px" />
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
