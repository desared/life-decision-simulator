"use client"

import { useTranslations } from 'next-intl'
import { Quote } from 'lucide-react'

export function TestimonialsSection() {
  const t = useTranslations('testimonials')

  const testimonials = [
    {
      text: t('quote1.text'),
      author: t('quote1.author'),
      role: t('quote1.role')
    },
    {
      text: t('quote2.text'),
      author: t('quote2.author'),
      role: t('quote2.role')
    },
    {
      text: t('quote3.text'),
      author: t('quote3.author'),
      role: t('quote3.role')
    }
  ]

  return (
    <section className="py-20 md:py-32 bg-secondary/30">
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
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-2xl border border-border bg-card p-8 shadow-sm"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />
              <p className="mb-6 text-foreground leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
