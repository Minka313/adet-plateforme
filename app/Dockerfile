# Image de production de la plateforme ADET (Next.js standalone + Payload)
FROM node:22-alpine AS base
# pnpm épinglé (même version que le lockfile) plutôt que corepack, plus fiable en CI
RUN apk add --no-cache libc6-compat && npm install -g pnpm@10.28.0

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Le build lit la base (pages pré-générées) : DATABASE_URL et PAYLOAD_SECRET sont passés en arguments
ARG DATABASE_URL
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SITE_URL
ENV DATABASE_URL=$DATABASE_URL PAYLOAD_SECRET=$PAYLOAD_SECRET NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Applique les migrations une seule fois avant le build (évite les migrations concurrentes des workers)
RUN pnpm build:prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Fichiers envoyés depuis /admin (si pas de stockage S3) : volumes persistants
RUN mkdir -p media documents && chown nextjs:nodejs media documents
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD wget -qO- http://127.0.0.1:3000/api/sante || exit 1
CMD ["node", "server.js"]
