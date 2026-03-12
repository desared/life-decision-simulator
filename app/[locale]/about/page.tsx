import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import AboutClient from './about-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'About shouldi',
    titleDe: 'Über shouldi',
    descriptionEn: 'Learn about shouldi\'s mission to help people make better decisions through AI-powered simulation and scenario analysis.',
    descriptionDe: 'Erfahren Sie mehr über shouldis Mission, Menschen bei besseren Entscheidungen durch KI-gestützte Simulation zu helfen.',
    path: '/about',
  })
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <AboutClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'About', '/about')} />
    </>
  )
}
