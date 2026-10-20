import type { Metadata } from 'next'

import { EnTetePage } from '@/components/Blocs'
import { Icone } from '@/components/ui/Icone'
import { Motif } from '@/components/ui/Motif'
import { dico, type Langue } from '@/i18n'
import { telHref } from '@/lib/format'
import { getCoordonnees } from '@/lib/payload'

import { Formulaire } from './Formulaire'

type Props = { params: Promise<{ lang: Langue }>; searchParams: Promise<{ objet?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.contact }
}

export default async function Contact({ params, searchParams }: Props) {
  const [{ lang }, { objet }, co] = await Promise.all([params, searchParams, getCoordonnees()])
  const d = dico(lang)
  return (
    <>
      <EnTetePage surtitre={d.contact.surtitre} titre={d.contact.titre} intro={d.contact.intro} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="conteneur contact">
          <Formulaire lang={lang} t={d.contact} objetInitial={objet} />
          <aside className="contact__infos" data-reveal>
            <Motif couleur="#fff" opacite={0.04} taille={48} />
            <h2>{d.contact.coordonnees}</h2>
            {co.adresse && (
              <p className="pied__ligne">
                <Icone nom="lieu" taille={18} />
                <span className="pre">{co.adresse}</span>
              </p>
            )}
            {co.email && (
              <p className="pied__ligne">
                <Icone nom="mail" taille={18} />
                <a href={`mailto:${co.email}`}>{co.email}</a>
              </p>
            )}
            {co.telephones?.map((t) => (
              <p key={t.id} className="pied__ligne">
                <Icone nom="telephone" taille={18} />
                <a href={telHref(t.numero)}>{t.numero}</a>
              </p>
            ))}
            {co.whatsapp && (
              <a className="bouton bouton--whatsapp" href={`https://wa.me/${co.whatsapp}`} rel="noopener noreferrer" target="_blank">
                {d.contact.whatsapp}
              </a>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
