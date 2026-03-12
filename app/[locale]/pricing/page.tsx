import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import PricingClient from './pricing-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Pricing - Simple, Transparent Plans',
    titleDe: 'Preise - Einfache, transparente Pläne',
    descriptionEn: 'Start free with 2 simulations. Upgrade to per-scenario or Pro for unlimited AI-powered decision analysis. No hidden fees.',
    descriptionDe: 'Starten Sie kostenlos mit 2 Simulationen. Upgraden Sie auf Pro für unbegrenzte KI-gestützte Entscheidungsanalyse. Keine versteckten Gebühren.',
    path: '/pricing',
  })
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <PricingClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Pricing', '/pricing')} />
    </>
  )
}
