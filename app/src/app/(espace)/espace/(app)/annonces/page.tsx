import type { Metadata } from 'next'

import { estBureau } from '@/access'
import { CarteAnnonce } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'

import { FormulaireAnnonce } from './Formulaire'

export const metadata: Metadata = { title: 'Annonces' }

export default async function Annonces() {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const annonces = await payload.find({ collection: 'annonces', sort: ['-epinglee', '-createdAt'], limit: 50, depth: 1, user, overrideAccess: false })

  return (
    <div className="pile">
      <section className="salut">
        <h1>Annonces</h1>
        <p className="salut__role">Les informations du bureau pour toute l’équipe.</p>
      </section>
      {estBureau(user) && <FormulaireAnnonce />}
      {annonces.docs.length ? (
        <div className="pile pile--serree">
          {annonces.docs.map((a) => (
            <CarteAnnonce key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <p className="vide-espace">Aucune annonce pour le moment.</p>
      )}
    </div>
  )
}
