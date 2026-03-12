import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import PrivacyClient from './privacy-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Privacy Policy',
    titleDe: 'Datenschutzerklärung',
    descriptionEn: 'Read shouldi\'s privacy policy. Learn how we collect, use, and protect your personal data.',
    descriptionDe: 'Lesen Sie shouldis Datenschutzerklärung. Erfahren Sie, wie wir Ihre personenbezogenen Daten erheben, verwenden und schützen.',
    path: '/privacy',
  })
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <PrivacyClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Privacy Policy', '/privacy')} />
    </>
  )
}
