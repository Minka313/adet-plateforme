import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const JITSI = '"https://8x8.vc" "https://meet.jit.si"'

const ENTETES_SECURITE = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
  // Prévisualisation : aucune page indexée tant que le site n'est pas ouvert au public
  ...(process.env.NEXT_PUBLIC_INDEXATION === 'non' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
]

const nextConfig: NextConfig = {
  // « standalone » pour l'image Docker ; Vercel a son propre format de sortie (incompatible)
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:chemin*', headers: ENTETES_SECURITE },
      // Visio : caméra, micro et partage d'écran autorisés, pour ces pages et les serveurs Jitsi uniquement
      ...['/espace/visio', '/espace/reunions/:id/visio'].map((source) => ({
        source,
        headers: [{ key: 'Permissions-Policy', value: `camera=(self ${JITSI}), microphone=(self ${JITSI}), display-capture=(self ${JITSI}), fullscreen=(self ${JITSI}), geolocation=(), interest-cohort=()` }],
      })),
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
      {
        pathname: '/photos/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
