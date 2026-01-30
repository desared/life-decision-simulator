"use client"

import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchAutocomplete } from '@/components/search-autocomplete'

interface HeroSectionProps {
  customQuestion: string
  setCustomQuestion: (value: string) => void
  onSelectScenario: (id: string) => void
  onPremiumClick: () => void
}

export function HeroSection({
  customQuestion,
  setCustomQuestion,
  onSelectScenario,
  onPremiumClick
}: HeroSectionProps) {
  const t = useTranslations('hero')

  return (
    <section className="relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              AI-Powered Decision Analysis
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 md:mb-10 max-w-2xl text-base md:text-lg text-muted-foreground lg:text-xl">
            {t('subtitle')}
          </p>

          {/* Search with Autocomplete */}
          <div className="mx-auto mb-4 flex max-w-xl gap-3">
            <SearchAutocomplete
              value={customQuestion}
              onChange={setCustomQuestion}
              onSelectScenario={onSelectScenario}
              onPremiumClick={onPremiumClick}
              placeholder={t('inputPlaceholder')}
            />
            <Button
              onClick={onPremiumClick}
              className="h-14 px-6 md:px-8 gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="hidden sm:inline">{t('simulate')}</span>
              <ArrowRight className="h-5 w-5 sm:ml-2" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('tryExample')}
          </p>

          {/* Social proof */}
          <div className="mt-10 md:mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(65 + i - 1)}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">50,000+</span> decisions simulated
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm font-medium">4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
