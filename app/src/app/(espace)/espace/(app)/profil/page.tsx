import type { Metadata } from 'next'

import { ROLES } from '@/access'
import { exigerUtilisateur } from '@/lib/session'

import { FormulaireMotDePasse, FormulaireProfil } from './Formulaires'

export const metadata: Metadata = { title: 'Profil' }

export default async function Profil() {
  const user = await exigerUtilisateur()
  const pole = user.pole && typeof user.pole === 'object' ? user.pole.nom : null
  const roles = (user.roles ?? []).map((r) => ROLES.find((x) => x.value === r)?.label ?? r)
  return (
    <div className="pile">
      <section className="salut">
        <h1>Mon profil</h1>
        <p className="salut__role">
          {user.email}
          {pole && ` · ${pole}`}
          {!!roles.length && ` · ${roles.join(', ')}`}
        </p>
      </section>
      <div className="deux-colonnes">
        <FormulaireProfil nom={user.nom ?? ''} fonction={user.fonction ?? ''} telephone={user.telephone ?? ''} />
        <FormulaireMotDePasse />
      </div>
      <p className="note-espace">Votre pôle et vos rôles sont attribués par un administrateur de l’ADET.</p>
    </div>
  )
}
