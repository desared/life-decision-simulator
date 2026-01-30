"use client"

import { useTranslations } from 'next-intl'
import { BarChart3, Zap, Shield, Database, Infinity, Download } from 'lucide-react'

export function FeaturesSection() {
  const t = useTranslations('features')

  const features = [
    {
      icon: BarChart3,
      title: t('probabilistic.title'),
      description: t('probabilistic.description')
    },
    {
      icon: Zap,
      title: t('instant.title'),
      description: t('instant.description')
    },
    {
      icon: Shield,
      title: t('private.title'),
      description: t('private.description')
    },
    {
      icon: Database,
      title: t('datadriven.title'),
      description: t('datadriven.description')
    },
    {
      icon: Infinity,
      title: t('scenarios.title'),
      description: t('scenarios.description')
    },
    {
      icon: Download,
      title: t('export.title'),
      description: t('export.description')
    }
  ]

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
