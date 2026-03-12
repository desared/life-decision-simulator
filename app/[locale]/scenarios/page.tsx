import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import ScenariosClient from './scenarios-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Decision Scenarios - Career, Housing, Relocation',
    titleDe: 'Entscheidungsszenarien - Karriere, Wohnen, Umzug',
    descriptionEn: 'Explore pre-built decision scenarios: job changes, buy vs rent, city relocation, and custom questions. AI-powered outcome simulation.',
    descriptionDe: 'Erkunden Sie vorgefertigte Entscheidungsszenarien: Jobwechsel, Kaufen vs. Mieten, Umzug und individuelle Fragen. KI-gestützte Ergebnissimulation.',
    path: '/scenarios',
  })
}

export default async function ScenariosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <ScenariosClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Scenarios', '/scenarios')} />
    </>
  )
}
