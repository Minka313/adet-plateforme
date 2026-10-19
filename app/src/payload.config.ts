import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { fr } from '@payloadcms/translations/languages/fr'

import { Actualites } from './collections/Actualites'
import { Departements } from './collections/Departements'
import { Documents } from './collections/Documents'
import { Equipe } from './collections/Equipe'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Partenaires } from './collections/Partenaires'
import { Realisations } from './collections/Realisations'
import { Users } from './collections/Users'
import { Association } from './globals/Association'
import { Coordonnees } from './globals/Coordonnees'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Administration ADET',
    },
  },
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },
  collections: [Realisations, Actualites, Partenaires, Equipe, Departements, Documents, Media, Messages, Users],
  globals: [Association, Coordonnees],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
