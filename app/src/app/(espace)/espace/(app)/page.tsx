import type { Metadata } from 'next'
import Link from 'next/link'

import { CarteAnnonce, CarteMembre } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur, prenom } from '@/lib/session'

export const metadata: Metadata = { title: 'Accueil' }

export default async function TableauDeBordEspace() {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const idPole = user.pole && typeof user.pole === 'object' ? user.pole.id : user.pole
  const [annonces, collegues] = await Promise.all([
    payload.find({ collection: 'annonces', sort: ['-epinglee', '-createdAt'], limit: 3, depth: 1, user, overrideAccess: false }),
    idPole
      ? payload.find({
          collection: 'users',
          where: { and: [{ pole: { equals: idPole } }, { actif: { not_equals: false } }, { id: { not_equals: user.id } }] },
          sort: 'nom',
          limit: 50,
          depth: 1,
          user,
          overrideAccess: false,
        })
      : null,
  ])
  const pole = user.pole && typeof user.pole === 'object' ? user.pole : null
  const heure = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Dakar' }).format(new Date()))
  const aujourdhui = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' }).format(new Date())

  return (
    <div className="pile">
      <section className="salut">
        <p className="salut__date">{aujourdhui}</p>
        <h1>
          {heure < 18 ? 'Bonjour' : 'Bonsoir'} {prenom(user)}
        </h1>
        <p className="salut__role">{[user.fonction, pole?.nom].filter(Boolean).join(' · ') || 'Équipe de l’ADET'}</p>
      </section>

      <section className="bloc">
        <div className="bloc__tete">
          <h2>Annonces</h2>
          <Link href="/espace/annonces">Toutes les annonces</Link>
        </div>
        {annonces.docs.length ? (
          <div className="pile pile--serree">
            {annonces.docs.map((a) => (
              <CarteAnnonce key={a.id} a={a} />
            ))}
          </div>
        ) : (
          <p className="vide-espace">Aucune annonce pour le moment. Le bureau publie ici les informations pour toute l’équipe.</p>
        )}
      </section>

      {pole && (
        <section className="bloc">
          <div className="bloc__tete">
            <h2>Mon pôle : {pole.nom}</h2>
            <Link href="/espace/annuaire">Toute l’équipe</Link>
          </div>
          {collegues?.docs.length ? (
            <ul className="membres">
              {collegues.docs.map((m) => (
                <CarteMembre key={m.id} m={m} />
              ))}
            </ul>
          ) : (
            <p className="vide-espace">Personne d’autre n’est encore rattaché à ce pôle.</p>
          )}
        </section>
      )}

      <section className="bloc bloc--note">
        <h2>Bientôt dans l’espace pro</h2>
        <p>Les tâches de chaque pôle, les réunions avec rappels et visio, les rapports d’activité à faire valider, et les notifications sur votre téléphone.</p>
      </section>
    </div>
  )
}
