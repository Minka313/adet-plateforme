import type { Access, FieldAccess } from 'payload'

type RoleUser = { roles?: string[] | null } | null | undefined

/** Rôles des comptes. Les deux premiers gèrent le site public et ouvrent le back-office ; tous ouvrent l'espace pro. */
export const ROLES = [
  { label: 'Administrateur', value: 'admin' },
  { label: 'Éditeur (contenus du site)', value: 'editeur' },
  { label: 'Bureau (direction)', value: 'bureau' },
  { label: 'Responsable de pôle', value: 'responsable' },
  { label: 'Membre de l’équipe', value: 'membre' },
  { label: 'Formateur', value: 'formateur' },
] as const

export type Role = (typeof ROLES)[number]['value']

export const aRole = (user: RoleUser, ...roles: Role[]): boolean => Boolean(user?.roles?.some((r) => roles.includes(r as Role)))

export const isAdmin = (user: RoleUser): boolean => aRole(user, 'admin')

/** Gère les contenus du site public et ouvre le back-office /admin */
export const estEquipeSite = (user: RoleUser): boolean => aRole(user, 'admin', 'editeur')

/** Dirige l'association : publie les annonces internes, valide */
export const estBureau = (user: RoleUser): boolean => aRole(user, 'admin', 'bureau')

export const anyone: Access = () => true

/** Contenus du site : réservés à l'équipe du site (un membre de l'espace pro ne peut pas les modifier) */
export const equipeSite: Access = ({ req: { user } }) => estEquipeSite(user)

/** Espace pro : tout compte de l'équipe ADET */
export const membreEquipe: Access = ({ req: { user } }) => Boolean(user)

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)

// Public : uniquement les contenus publiés. Équipe du site : tout.
export const publieOuEquipeSite: Access = ({ req: { user } }) => {
  if (estEquipeSite(user)) return true
  return { _status: { equals: 'published' } }
}
