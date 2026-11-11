import type { Metadata } from 'next'

import { CarteMembre } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'

export const metadata: Metadata = { title: 'Équipe' }

export default async function Annuaire() {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const [membres, poles] = await Promise.all([
    payload.find({ collection: 'users', where: { actif: { not_equals: false } }, sort: 'nom', limit: 300, depth: 0, user, overrideAccess: false }),
    payload.find({ collection: 'departements', sort: 'ordre', limit: 50, depth: 0, locale: 'fr' }),
  ])
  const idPole = (m: (typeof membres.docs)[number]) => (m.pole && typeof m.pole === 'object' ? m.pole.id : m.pole)
  const groupes = [
    ...poles.docs.map((p) => ({ cle: String(p.id), titre: p.nom, membres: membres.docs.filter((m) => idPole(m) === p.id) })),
    { cle: 'aucun', titre: 'Sans pôle', membres: membres.docs.filter((m) => !idPole(m)) },
  ].filter((g) => g.membres.length)

  return (
    <div className="pile">
      <section className="salut">
        <h1>L’équipe</h1>
        <p className="salut__role">
          {membres.totalDocs} {membres.totalDocs > 1 ? 'personnes' : 'personne'}. Touchez le téléphone pour appeler, ou l’icône WhatsApp pour écrire.
        </p>
      </section>
      {groupes.map((g) => (
        <section key={g.cle} className="bloc">
          <div className="bloc__tete">
            <h2>{g.titre}</h2>
            <span className="bloc__compte">{g.membres.length}</span>
          </div>
          <ul className="membres">
            {g.membres.map((m) => (
              <CarteMembre key={m.id} m={m} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
