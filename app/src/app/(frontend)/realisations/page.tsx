import type { Metadata } from 'next'

import { CarteRealisation, EnTetePage, Vide } from '@/components/Blocs'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60
export const metadata: Metadata = { title: 'Nos réalisations' }

export default async function Realisations() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'realisations',
    where: { _status: { equals: 'published' } },
    limit: 100,
    depth: 1,
  })
  return (
    <>
      <EnTetePage
        surtitre="Réalisations"
        titre="Ce que nous faisons sur le terrain"
        intro="Formations, partenariats, valorisation des ressources locales : découvrez les projets menés par l'ADET et leurs résultats."
      />
      <section className="section">
        <div className="conteneur">
          {docs.length ? (
            <div className="grille-cartes">
              {docs.map((r) => (
                <CarteRealisation key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <Vide>Les premières réalisations seront bientôt publiées.</Vide>
          )}
        </div>
      </section>
    </>
  )
}
