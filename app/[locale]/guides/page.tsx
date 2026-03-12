import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import GuidesClient from './guides-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Decision Guides - Frameworks for Better Choices',
    titleDe: 'Entscheidungsleitfäden - Methoden für bessere Entscheidungen',
    descriptionEn: 'Learn proven decision-making frameworks: Pros & Cons Analysis, Weighted Decision Matrix, and Goal Alignment methods.',
    descriptionDe: 'Lernen Sie bewährte Entscheidungsmethoden: Pro-Contra-Analyse, Gewichtete Entscheidungsmatrix und Zielabgleich.',
    path: '/guides',
  })
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <GuidesClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Guides', '/guides')} />
    </>
  )
}
