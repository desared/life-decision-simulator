import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import HelpClient from './help-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Help Center',
    titleDe: 'Hilfezentrum',
    descriptionEn: 'Find answers about using shouldi\'s AI decision simulator. Getting started, simulations, and account management.',
    descriptionDe: 'Finden Sie Antworten zur Nutzung von shouldis KI-Entscheidungssimulator. Erste Schritte, Simulationen und Kontoverwaltung.',
    path: '/help',
  })
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <HelpClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Help', '/help')} />
    </>
  )
}
