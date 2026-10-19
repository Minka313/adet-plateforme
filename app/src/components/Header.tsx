import Link from 'next/link'

import { Logo } from './Logo'
import { NAVIGATION } from './navigation'

export function Header() {
  return (
    <header className="entete">
      <div className="conteneur entete__barre">
        <Logo />
        <nav className="nav" aria-label="Navigation principale">
          <ul className="nav__liens">
            {NAVIGATION.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="bouton bouton--petit">
            Nous contacter
          </Link>
        </nav>
        {/* Menu mobile sans JavaScript */}
        <details className="menu-mobile">
          <summary aria-label="Ouvrir le menu">
            <span />
            <span />
            <span />
          </summary>
          <ul>
            {NAVIGATION.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </details>
      </div>
    </header>
  )
}
