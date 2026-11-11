import Image from 'next/image'
import Link from 'next/link'

import { estEquipeSite } from '@/access'
import { EnregistrementAppli } from '@/components/espace/Appli'
import { Cloche } from '@/components/espace/Cloche'
import { IconeEspace } from '@/components/espace/Icones'
import { BoutonDeconnexion, NavigationEspace } from '@/components/espace/Navigation'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur, initiales } from '@/lib/session'

// Toujours la session du moment : jamais de page mise en cache entre deux personnes
export const dynamic = 'force-dynamic'

export default async function CadreEspace({ children }: { children: React.ReactNode }) {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const { totalDocs: nonLues } = await payload.count({
    collection: 'notifications',
    where: { and: [{ destinataire: { equals: user.id } }, { lue: { equals: false } }] },
    overrideAccess: true,
  })
  return (
    <div className="espace-cadre">
      <header className="espace-haut">
        <div className="espace-haut__barre">
          <Link href="/espace" className="espace-haut__logo" aria-label="Espace pro, accueil">
            <Image src="/brand/adet-logo.png" alt="ADET" width={1251} height={795} priority sizes="80px" />
            <span>Espace pro</span>
          </Link>
          <NavigationEspace />
          <div className="espace-haut__compte">
            <Cloche initial={nonLues} />
            {estEquipeSite(user) && (
              <Link href="/admin" className="bouton-icone" aria-label="Back-office du site" title="Back-office du site">
                <IconeEspace nom="reglages" />
              </Link>
            )}
            <Link href="/fr" className="bouton-icone" aria-label="Voir le site public" title="Voir le site public">
              <IconeEspace nom="site" />
            </Link>
            <Link href="/espace/profil" className="avatar" aria-label="Mon profil" title={user.nom ?? user.email}>
              {initiales(user)}
            </Link>
            <BoutonDeconnexion />
          </div>
        </div>
        <div className="lisere" aria-hidden="true" />
      </header>
      <main className="espace-contenu">{children}</main>
      <EnregistrementAppli />
    </div>
  )
}
