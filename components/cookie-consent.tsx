"use client"

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

interface CookieConsentContextType {
  preferences: CookiePreferences
  hasConsented: boolean
  updatePreferences: (prefs: Partial<CookiePreferences>) => void
}

const CookieConsentContext = createContext<CookieConsentContextType>({
  preferences: { necessary: true, analytics: false, marketing: false },
  hasConsented: false,
  updatePreferences: () => {},
})

export function useCookieConsent() {
  return useContext(CookieConsentContext)
}

const COOKIE_KEY = 'shouldi-cookie-consent'

function getStoredPreferences(): { preferences: CookiePreferences; hasConsented: boolean } | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(COOKIE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

function storePreferences(preferences: CookiePreferences) {
  if (typeof window === 'undefined') return
  localStorage.setItem(COOKIE_KEY, JSON.stringify({ preferences, hasConsented: true }))
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })
  const [hasConsented, setHasConsented] = useState(true) // default true to prevent flash

  useEffect(() => {
    const stored = getStoredPreferences()
    if (stored) {
      setPreferences(stored.preferences)
      setHasConsented(stored.hasConsented)
    } else {
      setHasConsented(false)
    }
  }, [])

  const updatePreferences = useCallback((prefs: Partial<CookiePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...prefs, necessary: true }
      storePreferences(updated)
      return updated
    })
    setHasConsented(true)
  }, [])

  return (
    <CookieConsentContext.Provider value={{ preferences, hasConsented, updatePreferences }}>
      {children}
      {!hasConsented && <CookieBanner />}
    </CookieConsentContext.Provider>
  )
}

function CookieBanner() {
  const t = useTranslations('cookies')
  const params = useParams()
  const locale = params.locale || 'en'
  const { updatePreferences } = useCookieConsent()
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const handleAcceptAll = () => {
    updatePreferences({ analytics: true, marketing: true })
  }

  const handleRejectOptional = () => {
    updatePreferences({ analytics: false, marketing: false })
  }

  const handleSavePreferences = () => {
    updatePreferences({ analytics, marketing })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card shadow-lg p-5 md:p-6">
        {!showSettings ? (
          <>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {t('banner.title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('banner.description')}{' '}
              <Link href={`/${locale}/cookies`} className="text-primary hover:underline">
                {t('banner.learnMore')}
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button onClick={handleAcceptAll} className="gradient-primary text-white flex-1 sm:flex-none">
                {t('banner.acceptAll')}
              </Button>
              <Button onClick={handleRejectOptional} variant="outline" className="flex-1 sm:flex-none">
                {t('banner.rejectOptional')}
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                size="sm"
                className="flex-1 sm:flex-none gap-1.5 text-muted-foreground"
              >
                <Settings2 className="h-4 w-4" />
                {t('banner.customize')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-foreground mb-4">
              {t('banner.customizeTitle')}
            </h3>

            <div className="space-y-4 mb-5">
              {/* Necessary */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('categories.necessary.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('categories.necessary.description')}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <div className="h-5 w-9 rounded-full bg-primary flex items-center justify-end px-0.5">
                    <div className="h-4 w-4 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('categories.analytics.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('categories.analytics.description')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalytics(!analytics)}
                  className={`shrink-0 pt-0.5 h-5 w-9 rounded-full flex items-center px-0.5 transition-colors ${
                    analytics ? 'bg-primary justify-end' : 'bg-muted justify-start'
                  }`}
                >
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('categories.marketing.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('categories.marketing.description')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMarketing(!marketing)}
                  className={`shrink-0 pt-0.5 h-5 w-9 rounded-full flex items-center px-0.5 transition-colors ${
                    marketing ? 'bg-primary justify-end' : 'bg-muted justify-start'
                  }`}
                >
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button onClick={handleSavePreferences} className="gradient-primary text-white flex-1 sm:flex-none">
                {t('banner.savePreferences')}
              </Button>
              <Button onClick={handleAcceptAll} variant="outline" className="flex-1 sm:flex-none">
                {t('banner.acceptAll')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
