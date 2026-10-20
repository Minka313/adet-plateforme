import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// Tests d'intégration : base PostgreSQL dédiée (DATABASE_URL_TEST), schéma créé automatiquement.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST || 'postgres://adet:adet@127.0.0.1:5432/adet_test',
      PAYLOAD_SECRET: 'secret-de-test',
    },
  },
})
