import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { fr } from '@payloadcms/translations/languages/fr'

import { Abonnes } from './collections/Abonnes'
import { Actualites } from './collections/Actualites'
import { Departements } from './collections/Departements'
import { Documents } from './collections/Documents'
import { Equipe } from './collections/Equipe'
import { Filieres } from './collections/Filieres'
import { Formations } from './collections/Formations'
import { Inscriptions } from './collections/Inscriptions'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Opportunites } from './collections/Opportunites'
import { Partenaires } from './collections/Partenaires'
import { Realisations } from './collections/Realisations'
import { Sessions } from './collections/Sessions'
import { Structures } from './collections/Structures'
import { Territoires } from './collections/Territoires'
import { Users } from './collections/Users'
import { Association } from './globals/Association'
import { Coordonnees } from './globals/Coordonnees'
import { Photos } from './globals/Photos'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL: SITE,
  // Seul le site lui-même peut appeler l'API avec des cookies de session
  csrf: [SITE],
  cors: [SITE],
  admin: {
    user: Users.slug,
    avatar: 'default',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Administration ADET',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    components: {
      beforeDashboard: ['/components/admin/TableauDeBord'],
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icone',
      },
    },
  },
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },
  collections: [Territoires, Filieres, Opportunites, Structures, Formations, Sessions, Inscriptions, Realisations, Actualites, Partenaires, Equipe, Departements, Documents, Media, Messages, Abonnes, Users],
  globals: [Association, Coordonnees, Photos],
  editor: lexicalEditor(),
  // E-mails : SMTP configuré par variables d'environnement (sinon affichés dans la console)
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'no-reply@adet.sn',
        defaultFromName: 'ADET',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // En production, le schéma évolue uniquement par migrations (src/migrations), appliquées au démarrage
    prodMigrations: migrations,
  }),
  endpoints: [
    {
      // GET /api/sante : supervision (base de données joignable ?)
      path: '/sante',
      method: 'get',
      handler: async (req) => {
        try {
          await req.payload.count({ collection: 'users', overrideAccess: true })
          return Response.json({ statut: 'ok', heure: new Date().toISOString() })
        } catch {
          return Response.json({ statut: 'erreur', detail: 'base de données injoignable' }, { status: 503 })
        }
      },
    },
  ],
  sharp,
  plugins: [
    // Médias et documents : Vercel Blob (hébergement Vercel) ou stockage S3 (R2, Scaleway…) si configuré ;
    // sinon fichiers locaux (dossiers media/ et documents/)
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true, documents: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { media: true, documents: true },
            bucket: process.env.S3_BUCKET,
            config: {
              endpoint: process.env.S3_ENDPOINT || undefined,
              region: process.env.S3_REGION || 'auto',
              forcePathStyle: Boolean(process.env.S3_ENDPOINT),
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
          }),
        ]
      : []),
  ],
})
