import type { Metadata } from 'next'

import { CarteActualite, EnTetePage, Vide } from '@/components/Blocs'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60
export const metadata: Metadata = { title: 'Actualités' }

export default async function Actualites() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'actualites',
    where: { _status: { equals: 'published' } },
    limit: 60,
    depth: 1,
  })
  return (
    <>
      <EnTetePage surtitre="Actualités" titre="La vie de l'ADET" intro="Événements, formations, partenariats : suivez nos dernières nouvelles." />
      <section className="section">
        <div className="conteneur">
          {docs.length ? (
            <div className="grille-cartes">
              {docs.map((a) => (
                <CarteActualite key={a.id} a={a} />
              ))}
            </div>
          ) : (
            <Vide>Aucune actualité pour le moment.</Vide>
          )}
        </div>
      </section>
    </>
  )
}
