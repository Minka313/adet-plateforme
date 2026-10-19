import type { Metadata } from 'next'

import { EnTetePage } from '@/components/Blocs'
import { telHref } from '@/lib/format'
import { getCoordonnees } from '@/lib/payload'

import { Formulaire } from './Formulaire'

export const metadata: Metadata = { title: 'Contact' }

type Props = { searchParams: Promise<{ objet?: string }> }

export default async function Contact({ searchParams }: Props) {
  const [co, { objet }] = await Promise.all([getCoordonnees(), searchParams])
  return (
    <>
      <EnTetePage
        surtitre="Contact"
        titre="Écrivez-nous"
        intro="Une question, une idée de projet, une proposition de partenariat ? Nous vous répondons rapidement."
      />
      <section className="section">
        <div className="conteneur contact">
          <Formulaire objetInitial={objet} />
          <aside className="contact__infos">
            <h2>Nos coordonnées</h2>
            {co.adresse && <p className="pied__adresse">{co.adresse}</p>}
            <ul>
              {co.email && (
                <li>
                  <a href={`mailto:${co.email}`}>{co.email}</a>
                </li>
              )}
              {co.telephones?.map((t) => (
                <li key={t.id}>
                  <a href={telHref(t.numero)}>{t.numero}</a>
                </li>
              ))}
            </ul>
            {co.whatsapp && (
              <a className="bouton bouton--whatsapp" href={`https://wa.me/${co.whatsapp}`} rel="noopener noreferrer" target="_blank">
                Écrire sur WhatsApp
              </a>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
