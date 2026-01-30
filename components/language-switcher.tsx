"use client"

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Button
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs font-medium"
        onClick={() => switchLocale('en')}
      >
        EN
      </Button>
      <Button
        variant={locale === 'de' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs font-medium"
        onClick={() => switchLocale('de')}
      >
        DE
      </Button>
    </div>
  )
}
