import type { Metadata } from 'next'
import Link from 'next/link'

import { EnTetePage, Vide } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60
export const metadata: Metadata = { title: 'Partenaires' }

export default async function Partenaires() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'partenaires', limit: 200, depth: 1 })
  return (
    <>
      <EnTetePage
        surtitre="Partenaires"
        titre="Construire ensemble"
        intro="Acteurs publics et privés, organisations internationales, communautés locales : nos partenariats démultiplient l'impact sur le territoire."
      />
      <section className="section">
        <div className="conteneur">
          {docs.length ? (
            <ul className="liste-partenaires">
              {docs.map((p) => (
                <li key={p.id} className="fiche-partenaire">
                  <Picture media={p.logo} taille="vignette" className="fiche-partenaire__logo" sizes="120px" />
                  <div>
                    <h2>{p.nom}</h2>
                    {p.description && <p>{p.description}</p>}
                    {p.siteWeb && (
                      <a href={p.siteWeb} rel="noopener noreferrer" target="_blank">
                        Site web →
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Vide>La liste de nos partenaires sera bientôt publiée.</Vide>
          )}
        </div>
      </section>
      <section className="appel">
        <div className="conteneur appel__contenu">
          <div>
            <h2>Devenir partenaire de l&apos;ADET</h2>
            <p>Vous partagez notre vision d&apos;un développement territorial inclusif et durable ? Parlons-en.</p>
          </div>
          <Link href="/contact?objet=partenariat" className="bouton bouton--jaune">
            Proposer un partenariat
          </Link>
        </div>
      </section>
    </>
  )
}
