import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import CookiesClient from './cookies-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Cookie Policy',
    titleDe: 'Cookie-Richtlinie',
    descriptionEn: 'Learn about how shouldi uses cookies and similar technologies on our website.',
    descriptionDe: 'Erfahren Sie, wie shouldi Cookies und ähnliche Technologien auf unserer Website verwendet.',
    path: '/cookies',
  })
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <CookiesClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Cookie Policy', '/cookies')} />
    </>
  )
}
