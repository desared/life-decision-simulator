import type { Metadata } from 'next'

const BASE_URL = 'https://shouldi.io'

interface PageSeoConfig {
  titleEn: string
  titleDe: string
  descriptionEn: string
  descriptionDe: string
  path: string
  noindex?: boolean
}

export function generatePageMetadata(
  locale: string,
  config: PageSeoConfig,
): Metadata {
  const title = locale === 'de' ? config.titleDe : config.titleEn
  const description = locale === 'de' ? config.descriptionDe : config.descriptionEn
  const url = `${BASE_URL}/${locale}${config.path}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en${config.path}`,
        de: `${BASE_URL}/de${config.path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
    twitter: {
      title,
      description,
    },
    ...(config.noindex && {
      robots: { index: false, follow: false },
    }),
  }
}

export function buildBreadcrumbSchema(locale: string, pageName: string, pagePath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageName,
        item: `${BASE_URL}/${locale}${pagePath}`,
      },
    ],
  }
}
