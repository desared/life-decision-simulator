import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import LandingClient from './landing-client'

const BASE_URL = 'https://shouldi.io'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'AI Decision Simulator - See Your Future Before You Decide',
    titleDe: 'KI-Entscheidungssimulator - Sehen Sie Ihre Zukunft Bevor Sie Entscheiden',
    descriptionEn: 'Simulate life decisions with AI. Explore career changes, investments, relocating, and more with data-driven scenario analysis. Free to start.',
    descriptionDe: 'Simulieren Sie Lebensentscheidungen mit KI. Erkunden Sie Jobwechsel, Investitionen, Umzug und mehr mit datengetriebener Szenarioanalyse. Kostenlos starten.',
    path: '',
  })
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'shouldi',
    url: BASE_URL,
    applicationCategory: 'Decision Support',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description: 'AI-powered decision simulator for life choices',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`${key}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`${key}.answer`),
      },
    })),
  }

  return (
    <>
      <LandingClient />
      <JsonLd data={webAppSchema} />
      <JsonLd data={faqSchema} />
    </>
  )
}
