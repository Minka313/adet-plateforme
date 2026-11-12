import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { estBureau, ROLES } from '@/access'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'

import { EditeurModele } from '../../Formulaires'

export const metadata: Metadata = { title: 'Modèle de rapport' }

const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

export default async function EditionModele({ params }: { params: Promise<{ id: string }> }) {
  const user = await exigerUtilisateur()
  if (!estBureau(user)) notFound()
  const cle = (await params).id
  const payload = await getPayloadClient()
  const [modele, poles, membres] = await Promise.all([
    cle === 'nouveau' ? null : payload.find({ collection: 'modeles-rapport', where: { id: { equals: Number(cle) } }, limit: 1, depth: 0, user, overrideAccess: false }).then((r) => r.docs[0]),
    payload.find({ collection: 'departements', sort: 'ordre', limit: 50, depth: 0, locale: 'fr' }),
    payload.find({ collection: 'users', where: { actif: { not_equals: false } }, sort: 'nom', limit: 300, depth: 0, user, overrideAccess: false }),
  ])
  if (cle !== 'nouveau' && !modele) notFound()

  return (
    <div className="pile">
      <p>
        <Link href="/espace/rapports/modeles">← Modèles de rapport</Link>
      </p>
      <section className="salut">
        <h1>{modele ? modele.titre : 'Nouveau modèle'}</h1>
      </section>
      <EditeurModele
        modele={
          modele
            ? {
                id: modele.id,
                titre: modele.titre,
                description: modele.description,
                periodicite: modele.periodicite,
                jourLimite: modele.jourLimite,
                actif: modele.actif,
                sections: (modele.sections ?? []).map((s) => ({ intitule: s.intitule, aide: s.aide, obligatoire: s.obligatoire })),
                rolesAuteurs: modele.rolesAuteurs ?? [],
                polesAuteurs: (modele.polesAuteurs ?? []).map(id),
                personnesAuteurs: (modele.personnesAuteurs ?? []).map(id),
                validateurs: (modele.validateurs ?? []).map(id),
              }
            : undefined
        }
        roles={ROLES.filter((r) => r.value !== 'admin' && r.value !== 'editeur').map((r) => ({ id: r.value, nom: r.label }))}
        poles={poles.docs.map((p) => ({ id: p.id, nom: p.nom }))}
        membres={membres.docs.map((m) => ({ id: m.id, nom: m.nom || m.email }))}
      />
    </div>
  )
}
