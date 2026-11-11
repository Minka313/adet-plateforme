import type { Metadata } from 'next'

import { estOrganisateur } from '@/access'
import { CarteReunion } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { seuilAVenir } from '@/lib/rappels'
import { exigerUtilisateur } from '@/lib/session'

import { FormulaireReunion } from './Formulaires'

export const metadata: Metadata = { title: 'Réunions' }

export default async function Reunions() {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const seuil = seuilAVenir()
  const [aVenir, passees, membres] = await Promise.all([
    payload.find({ collection: 'reunions', where: { debut: { greater_than_equal: seuil } }, sort: 'debut', limit: 50, depth: 0, user, overrideAccess: false }),
    payload.find({ collection: 'reunions', where: { debut: { less_than: seuil } }, sort: '-debut', limit: 20, depth: 0, user, overrideAccess: false }),
    estOrganisateur(user)
      ? payload.find({ collection: 'users', where: { actif: { not_equals: false } }, sort: 'nom', limit: 300, depth: 0, user, overrideAccess: false })
      : null,
  ])

  return (
    <div className="pile">
      <section className="salut">
        <h1>Réunions</h1>
        <p className="salut__role">Les participants sont prévenus à la planification, puis la veille et le matin même.</p>
      </section>
      {membres && <FormulaireReunion membres={membres.docs.map((m) => ({ id: m.id, nom: m.nom || m.email }))} />}
      <section className="bloc">
        <h2>À venir</h2>
        {aVenir.docs.length ? (
          <ul className="reunions">
            {aVenir.docs.map((r) => (
              <CarteReunion key={r.id} r={r} />
            ))}
          </ul>
        ) : (
          <p className="vide-espace">Aucune réunion planifiée.</p>
        )}
      </section>
      {!!passees.docs.length && (
        <section className="bloc">
          <h2>Passées</h2>
          <ul className="reunions reunions--passees">
            {passees.docs.map((r) => (
              <CarteReunion key={r.id} r={r} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
