import Link from 'next/link'

import { dico, type Langue } from '@/i18n'

import { EnTetePage, TitreSection } from './Blocs'
import { Etoiles } from './ui/Etoiles'

type Rubrique = {
  titre: string
  intro: string
  elements: { titre: string; texte: string }[]
  lienLabel: string
}

/** Page d'attente d'une rubrique prévue mais pas encore ouverte (Phase 2 et suivantes) */
export function PageBientot({ lang, rubrique, lienHref }: { lang: Langue; rubrique: Rubrique; lienHref: string }) {
  const b = dico(lang).bientot
  return (
    <>
      <EnTetePage surtitre={b.surtitre} titre={rubrique.titre} intro={rubrique.intro} />
      <section className="section">
        <div className="conteneur">
          <TitreSection titre={b.contenu} />
          <ul className={`valeurs ${rubrique.elements.length === 3 ? 'valeurs--trois' : ''}`} data-reveal>
            {rubrique.elements.map((e) => (
              <li key={e.titre}>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </li>
            ))}
          </ul>
          <div className="vide bientot" data-reveal>
            <Etoiles className="vide__etoiles" />
            <p className="bientot__titre">{b.enAttendant}</p>
            <p className="bientot__texte">{b.enAttendantTexte}</p>
            <div className="bientot__actions">
              <a href="#newsletter" className="bouton bouton--or">
                {b.prevenu}
              </a>
              <Link href={lienHref} className="bouton bouton--clair">
                {rubrique.lienLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
