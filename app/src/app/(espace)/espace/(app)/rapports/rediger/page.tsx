import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { libellePeriode, periodesEcoulees } from '@/lib/periodes'
import { estAuteur } from '@/lib/rapports'
import { exigerUtilisateur } from '@/lib/session'

import { FormulaireRapport } from '../Formulaires'

export const metadata: Metadata = { title: 'Rédiger un rapport' }

export default async function Rediger({ searchParams }: { searchParams: Promise<{ modele?: string; periode?: string }> }) {
  const user = await exigerUtilisateur()
  const { modele: idModele, periode: demandee } = await searchParams
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'modeles-rapport', where: { id: { equals: Number(idModele) } }, limit: 1, depth: 0, user, overrideAccess: false })
  const modele = docs[0]
  if (!modele || !estAuteur(modele, user)) notFound()

  const ponctuel = modele.periodicite === 'ponctuel'
  // Seules les trois dernières périodes écoulées peuvent être rédigées
  const periodes = ponctuel ? [] : periodesEcoulees(modele.periodicite)
  const periode = ponctuel ? undefined : demandee && periodes.includes(demandee) ? demandee : periodes[0]
  if (periode) {
    const existant = await payload.find({
      collection: 'rapports',
      where: { and: [{ modele: { equals: modele.id } }, { auteur: { equals: user.id } }, { periode: { equals: periode } }] },
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
    })
    if (existant.docs[0]) redirect(`/espace/rapports/${existant.docs[0].id}`)
  }

  return (
    <div className="pile">
      <p>
        <Link href="/espace/rapports">← Rapports</Link>
      </p>
      <section className="salut">
        <h1>{modele.titre}</h1>
        <p className="salut__role">{periode ? `Période : ${libellePeriode(periode)}` : modele.description}</p>
      </section>
      {periodes.length > 1 && (
        <nav className="onglets" aria-label="Période">
          {periodes.map((p) => (
            <Link key={p} href={`/espace/rapports/rediger?modele=${modele.id}&periode=${p}`} aria-current={p === periode ? 'page' : undefined}>
              {libellePeriode(p)}
            </Link>
          ))}
        </nav>
      )}
      <FormulaireRapport modele={modele.id} periode={periode} sections={modele.sections ?? []} periodeLibre={ponctuel} />
    </div>
  )
}
