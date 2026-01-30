"use client"

import { useTranslations } from 'next-intl'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MoreSimulationsSectionProps {
  onSignUp: () => void
}

export function MoreSimulationsSection({ onSignUp }: MoreSimulationsSectionProps) {
  const t = useTranslations('moreSimulations')

  return (
    <section className="py-12 border-t border-border">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 md:p-12 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <h3 className="mb-3 text-2xl font-bold text-foreground">
            {t('title')}
          </h3>

          <p className="mb-6 text-muted-foreground max-w-md mx-auto">
            {t('description')}
          </p>

          <Button
            onClick={onSignUp}
            size="lg"
            className="gradient-primary text-white font-semibold px-8"
          >
            {t('cta')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
