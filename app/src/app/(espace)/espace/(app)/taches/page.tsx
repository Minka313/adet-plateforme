import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'

import { estBureau } from '@/access'
import { CarteTache } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'

import { FormulaireTache } from './Formulaire'

export const metadata: Metadata = { title: 'Tâches' }

const COLONNES = [
  { statut: 'a-faire', titre: 'À faire' },
  { statut: 'en-cours', titre: 'En cours' },
  { statut: 'fait', titre: 'Fait' },
] as const

type Vue = 'miennes' | 'pole' | 'toutes'

export default async function Taches({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const idPole = user.pole && typeof user.pole === 'object' ? user.pole.id : user.pole
  const demandee = (await searchParams).vue
  const vue: Vue = demandee === 'pole' && idPole ? 'pole' : demandee === 'toutes' ? 'toutes' : 'miennes'

  const filtre: Where =
    vue === 'miennes'
      ? { or: [{ responsables: { in: [user.id] } }, { creePar: { equals: user.id } }] }
      : vue === 'pole'
        ? { pole: { equals: idPole } }
        : {}

  const [taches, membres, poles] = await Promise.all([
    payload.find({ collection: 'taches', where: filtre, sort: 'echeance', limit: 300, depth: 1, user, overrideAccess: false }),
    payload.find({ collection: 'users', where: { actif: { not_equals: false } }, sort: 'nom', limit: 300, depth: 0, user, overrideAccess: false }),
    payload.find({ collection: 'departements', sort: 'ordre', limit: 50, depth: 0, locale: 'fr' }),
  ])

  const onglets: { vue: Vue; libelle: string }[] = [
    { vue: 'miennes', libelle: 'Mes tâches' },
    ...(idPole ? [{ vue: 'pole' as const, libelle: 'Mon pôle' }] : []),
    { vue: 'toutes', libelle: 'Toutes' },
  ]

  return (
    <div className="pile">
      <section className="salut">
        <h1>Tâches</h1>
        <p className="salut__role">Ce que l’équipe a à faire, par statut. Touchez « Commencer » ou « Terminer » pour avancer une tâche.</p>
      </section>

      <nav className="onglets" aria-label="Vue">
        {onglets.map((o) => (
          <Link key={o.vue} href={o.vue === 'miennes' ? '/espace/taches' : `/espace/taches?vue=${o.vue}`} aria-current={vue === o.vue ? 'page' : undefined}>
            {o.libelle}
          </Link>
        ))}
      </nav>

      <FormulaireTache
        membres={membres.docs.map((m) => ({ id: m.id, nom: m.nom || m.email }))}
        poles={poles.docs.map((p) => ({ id: p.id, nom: p.nom }))}
        moi={user.id}
        monPole={idPole}
      />

      <div className="colonnes">
        {COLONNES.map((c) => {
          const liste = taches.docs.filter((t) => t.statut === c.statut)
          // Les tâches faites les plus récentes seulement
          const visibles = c.statut === 'fait' ? [...liste].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10) : liste
          return (
            <section key={c.statut} className={`colonne colonne--${c.statut}`}>
              <h2>
                {c.titre} <span className="bloc__compte">{liste.length}</span>
              </h2>
              {visibles.length ? (
                <ul className="taches">
                  {visibles.map((t) => (
                    <CarteTache key={t.id} t={t} modifiable={estBureau(user) || [t.creePar, ...(t.responsables ?? [])].some((x) => (typeof x === 'object' ? x?.id : x) === user.id)} />
                  ))}
                </ul>
              ) : (
                <p className="vide-espace">Rien ici.</p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
