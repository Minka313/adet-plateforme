import type { Access, FieldAccess } from 'payload'

type RoleUser = { roles?: string[] | null } | null | undefined

export const isAdmin = (user: RoleUser): boolean => Boolean(user?.roles?.includes('admin'))

export const anyone: Access = () => true

export const loggedIn: Access = ({ req: { user } }) => Boolean(user)

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)

// Public : uniquement les contenus publiés. Connecté : tout.
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
