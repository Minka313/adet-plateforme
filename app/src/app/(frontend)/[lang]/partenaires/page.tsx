import type { Metadata } from 'next'

import { AppelAction, EnTetePage, Vide } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { Icone } from '@/components/ui/Icone'
import { dico, lien, type Langue } from '@/i18n'
import { getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

const TYPES: Record<string, { fr: string; en: string }> = {
  public: { fr: 'Institution publique', en: 'Public institution' },
  collectivite: { fr: 'Collectivité territoriale', en: 'Local authority' },
  technique: { fr: 'Partenaire technique et financier', en: 'Technical and financial partner' },
  international: { fr: 'Organisation internationale', en: 'International organisation' },
  prive: { fr: 'Secteur privé', en: 'Private sector' },
  'societe-civile': { fr: 'Société civile', en: 'Civil society' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.partenaires }
}

export default async function Partenaires({ params }: Props) {
  const { lang } = await params
  const d = dico(lang)
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'partenaires', limit: 200, depth: 1, ...loc(lang) })
  return (
    <>
      <EnTetePage surtitre={d.partenaires.surtitre} titre={d.partenaires.titre} intro={d.partenaires.intro} />
      <section className="section">
        <div className="conteneur">
          {docs.length ? (
            <ul className="liste-partenaires">
              {docs.map((p, i) => (
                <li key={p.id} className="fiche-partenaire" data-reveal style={{ ['--i' as string]: i % 3 }}>
                  <div className="fiche-partenaire__logo">
                    {p.logo && typeof p.logo === 'object' ? <Picture media={p.logo} taille="vignette" sizes="200px" /> : null}
                  </div>
                  {p.type && <p className="fiche-partenaire__type">{TYPES[p.type]?.[lang]}</p>}
                  <h2>{p.nom}</h2>
                  {p.description && <p>{p.description}</p>}
                  {p.siteWeb && (
                    <a href={p.siteWeb} rel="noopener noreferrer" target="_blank" className="lien-fleche">
                      {d.partenaires.site} <Icone nom="externe" taille={16} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Vide>{d.partenaires.vide}</Vide>
          )}
        </div>
      </section>
      <AppelAction
        titre={d.partenaires.appelTitre}
        texte={d.partenaires.appelTexte}
        href={lien(lang, '/contact?objet=partenariat')}
        label={d.partenaires.appelBouton}
      />
    </>
  )
}
