"use client"

import { useTranslations } from 'next-intl'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FAQSection() {
  const t = useTranslations('faq')

  const faqs = [
    { key: 'q1' },
    { key: 'q2' },
    { key: 'q3' },
    { key: 'q4' },
    { key: 'q5' },
    { key: 'q6' }
  ]

  return (
    <section id="faq" className="py-20 md:py-32 bg-secondary/30">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.key} value={faq.key} className="border-border">
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {t(`${faq.key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(`${faq.key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
