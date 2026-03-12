import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import AdvisorsClient from './advisors-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'AI Advisors - Expert Decision Analysis',
    titleDe: 'KI-Berater - Experten-Entscheidungsanalyse',
    descriptionEn: 'Meet 8 specialized AI advisors for finance, career, health, relationships, education, real estate, lifestyle, and business decisions.',
    descriptionDe: 'Lernen Sie 8 spezialisierte KI-Berater für Finanzen, Karriere, Gesundheit, Beziehungen, Bildung, Immobilien, Lifestyle und Geschäftsentscheidungen kennen.',
    path: '/advisors',
  })
}

export default async function AdvisorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <AdvisorsClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Advisors', '/advisors')} />
    </>
  )
}
