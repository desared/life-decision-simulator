import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import TermsClient from './terms-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Terms of Service',
    titleDe: 'Nutzungsbedingungen',
    descriptionEn: 'Read shouldi\'s terms of service. Understand the rules and guidelines for using our AI decision simulator.',
    descriptionDe: 'Lesen Sie shouldis Nutzungsbedingungen. Verstehen Sie die Regeln und Richtlinien für die Nutzung unseres KI-Entscheidungssimulators.',
    path: '/terms',
  })
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <TermsClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Terms of Service', '/terms')} />
    </>
  )
}
