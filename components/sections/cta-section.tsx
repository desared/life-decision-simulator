"use client"

import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CTASectionProps {
  onGetStarted: () => void
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const t = useTranslations('cta')

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-20">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {t('title')}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
              {t('subtitle')}
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg"
            >
              {t('button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
