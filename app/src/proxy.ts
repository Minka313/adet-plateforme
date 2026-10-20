import { NextResponse, type NextRequest } from 'next/server'

const LANGUES = ['fr', 'en']

/** Redirige les adresses sans langue (/, /contact…) vers /fr/… ou /en/… selon le navigateur. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (LANGUES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return

  const accepte = request.headers.get('accept-language') ?? ''
  const prefere = accepte
    .split(',')
    .map((p) => p.split(';')[0].trim().slice(0, 2).toLowerCase())
    .find((l) => LANGUES.includes(l))
  const lang = prefere ?? 'fr'

  request.nextUrl.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Tout sauf le back-office, l'API, les fichiers Next et les fichiers statiques
  matcher: ['/((?!admin|api|_next|brand|.*\\..*).*)'],
}
