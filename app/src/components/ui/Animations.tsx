'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Un seul observateur pour tout le site :
 * - [data-reveal] reçoit la classe « est-visible » quand il entre à l'écran ;
 * - [data-compte] anime son nombre de 0 à la valeur finale (le texte final est déjà dans le HTML).
 */
export function Animations() {
  const chemin = usePathname()

  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.est-visible), [data-compte]:not([data-compte-fait])')

    const compter = (el: HTMLElement) => {
      el.dataset.compteFait = '1'
      const cible = el.dataset.compte ?? ''
      const m = cible.match(/^(\D*)([\d\s.,]+)(.*)$/)
      if (!m || reduit) return
      const [, avant, nombre, apres] = m
      const valeur = parseFloat(nombre.replace(/\s/g, '').replace(',', '.'))
      if (!Number.isFinite(valeur)) return
      const debut = performance.now()
      const duree = 1400
      const pas = (t: number) => {
        const p = Math.min(1, (t - debut) / duree)
        const ease = 1 - Math.pow(1 - p, 3)
        el.textContent = `${avant}${Math.round(valeur * ease).toLocaleString('fr-FR')}${apres}`
        if (p < 1) requestAnimationFrame(pas)
        else el.textContent = cible
      }
      requestAnimationFrame(pas)
    }

    const obs = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue
          const el = e.target as HTMLElement
          if (el.hasAttribute('data-reveal')) el.classList.add('est-visible')
          if (el.hasAttribute('data-compte')) compter(el)
          obs.unobserve(el)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    elements.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [chemin])

  return null
}
