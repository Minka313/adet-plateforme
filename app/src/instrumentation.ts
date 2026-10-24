import type { Instrumentation } from 'next'

import { signalerErreur } from './lib/sentry'

/** Toute erreur serveur (pages, API, back-office, formulaires) est signalée à Sentry */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  await signalerErreur(
    err,
    { routeType: context.routeType, routePath: context.routePath, routerKind: context.routerKind, methode: request.method },
    request.path,
  )
}
