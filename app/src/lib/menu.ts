import { dico, lien, type Langue } from '@/i18n'

export type Lien = { href: string; label: string }
export type EntreeMenu = Lien | { label: string; enfants: Lien[] }

/** Menu principal, conforme à l'arborescence de docs/vision-plateforme.md */
export function menuPrincipal(lang: Langue): EntreeMenu[] {
  const n = dico(lang).nav
  return [
    { href: lien(lang, '/'), label: n.accueil },
    { href: lien(lang, '/decouvrir-kolda'), label: n.decouvrirKolda },
    { href: lien(lang, '/opportunites'), label: n.opportunites },
    { href: lien(lang, '/se-former'), label: n.seFormer },
    {
      label: n.adet,
      enfants: [
        { href: lien(lang, '/a-propos'), label: n.quiSommesNous },
        { href: lien(lang, '/equipe'), label: n.equipe },
        { href: lien(lang, '/realisations'), label: n.realisations },
        { href: lien(lang, '/actualites'), label: n.actualites },
        { href: lien(lang, '/partenaires'), label: n.partenaires },
        { href: lien(lang, '/documents'), label: n.documents },
      ],
    },
    {
      label: n.agir,
      enfants: [
        { href: lien(lang, '/contact'), label: n.contact },
        { href: lien(lang, '/contact?objet=partenariat'), label: n.devenirPartenaire },
        { href: lien(lang, '/contact?objet=adhesion'), label: n.adherer },
        { href: '#newsletter', label: n.newsletter },
      ],
    },
  ]
}
