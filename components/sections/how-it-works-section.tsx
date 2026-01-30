"use client"

import { useTranslations } from 'next-intl'
import { MousePointerClick, SlidersHorizontal, BarChart3 } from 'lucide-react'

export function HowItWorksSection() {
  const t = useTranslations('howItWorks')

  const steps = [
    {
      icon: MousePointerClick,
      title: t('step1.title'),
      description: t('step1.description'),
      step: '01'
    },
    {
      icon: SlidersHorizontal,
      title: t('step2.title'),
      description: t('step2.description'),
      step: '02'
    },
    {
      icon: BarChart3,
      title: t('step3.title'),
      description: t('step3.description'),
      step: '03'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(50%+60px)] w-[calc(100%-120px)] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
              )}

              <div className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 md:right-auto md:left-[calc(50%+40px)] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                  <step.icon className="h-10 w-10 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
