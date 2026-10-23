/**
 * Crée le premier compte administrateur (avant que quiconque ne le fasse depuis /admin).
 * Usage : ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm payload run scripts/creer-admin.ts
 * Ne fait rien si un compte existe déjà.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const email = process.env.ADMIN_EMAIL as string
const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
if (totalDocs > 0) {
  payload.logger.info(`Des comptes existent déjà (${totalDocs}) : aucun compte créé.`)
} else {
  await payload.create({
    collection: 'users',
    data: { email, password: process.env.ADMIN_PASSWORD as string, roles: ['admin'] } as never,
    overrideAccess: true,
  })
  payload.logger.info(`Compte administrateur créé : ${email}`)
}
process.exit(0)
