import type { Metadata } from 'next'

import { EnTetePage } from '@/components/Blocs'
import { dico, type Langue } from '@/i18n'
import { EMPLACEMENTS, PHOTOS_PAR_DEFAUT } from '@/data/photos'
import { getAssociation, getCoordonnees, getPhotos } from '@/lib/payload'

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).mentions.titre, robots: { index: false } }
}

export default async function Mentions({ params }: Props) {
  const { lang } = await params
  const d = dico(lang)
  const [asso, co, photos] = await Promise.all([getAssociation(lang), getCoordonnees(), getPhotos()])
  // Crédits des photos d'illustration encore affichées (non remplacées par une photo de l'ADET)
  const illustrations = EMPLACEMENTS.filter((e) => !photos[e]).map((e) => PHOTOS_PAR_DEFAUT[e])
  const fr = lang === 'fr'
  return (
    <>
      <EnTetePage titre={d.mentions.titre} />
      <section className="section">
        <div className="conteneur conteneur--texte prose">
          <h2>{fr ? 'Éditeur du site' : 'Publisher'}</h2>
          <p>
            {asso.nom} ({asso.sigle})
            <br />
            <span className="pre">{co.adresse}</span>
            {co.recepisse && (
              <>
                <br />
                {fr ? 'Reconnue sous le numéro' : 'Registered under number'} {co.recepisse}
              </>
            )}
            {co.ninea && (
              <>
                <br />
                NINEA : {co.ninea}
              </>
            )}
            {co.email && (
              <>
                <br />
                {co.email}
              </>
            )}
          </p>
          <h2>{fr ? 'Données personnelles' : 'Personal data'}</h2>
          <p>
            {fr
              ? "Les informations transmises via le formulaire de contact sont utilisées uniquement pour répondre à votre demande. Elles ne sont ni vendues ni cédées à des tiers. Vous pouvez demander leur suppression en écrivant à l'adresse ci-dessus."
              : 'Information sent through the contact form is used solely to respond to your request. It is never sold or shared with third parties. You may request its deletion by writing to the address above.'}
          </p>
          <h2>{fr ? 'Crédits' : 'Credits'}</h2>
          <p>
            {fr
              ? 'Cartographie : limites administratives geoBoundaries (Runfola et al., 2020), licence CC BY 4.0. Visuels sans photo : illustrations ADET.'
              : 'Mapping: administrative boundaries from geoBoundaries (Runfola et al., 2020), CC BY 4.0 licence. Non-photographic visuals: ADET illustrations.'}
          </p>
          {!!illustrations.length && (
            <>
              <p>{fr ? 'Photos d’illustration (Wikimedia Commons) :' : 'Illustrative photos (Wikimedia Commons):'}</p>
              <ul>
                {illustrations.map((p) => (
                  <li key={p.src}>
                    {p.alt[lang]} : {p.auteur},{' '}
                    <a href={p.source} rel="noopener noreferrer" target="_blank">
                      {p.licence}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  )
}
