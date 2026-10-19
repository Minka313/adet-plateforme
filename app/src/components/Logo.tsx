import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="ADET – accueil">
      <Image src="/brand/adet-logo.png" alt="ADET" width={1251} height={795} priority sizes="120px" />
    </Link>
  )
}
