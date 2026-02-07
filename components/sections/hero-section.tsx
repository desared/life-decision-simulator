"use client"

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, Search, Briefcase, Home, MapPin, GraduationCap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InteractiveNetwork } from '@/components/interactive-network'

interface HeroSectionProps {
  customQuestion: string
  setCustomQuestion: (value: string) => void
  onCustomQuestionSubmit: (question: string) => void
}

const rotatingQuestionsEn = [
  "Should I change careers?",
  "Should I move abroad?",
  "Should I start a business?",
  "Should I go back to school?",
  "Should I buy a house?",
]

const rotatingQuestionsDe = [
  "Sollte ich den Beruf wechseln?",
  "Sollte ich ins Ausland ziehen?",
  "Sollte ich ein Unternehmen gründen?",
  "Sollte ich wieder studieren?",
  "Sollte ich ein Haus kaufen?",
]

const floatingBubbles = [
  { icon: Briefcase, labelEn: "Career?", labelDe: "Karriere?", className: "top-8 left-[8%]", delay: "" },
  { icon: Home, labelEn: "Buy or rent?", labelDe: "Kaufen?", className: "top-16 right-[10%]", delay: "animation-delay-1000" },
  { icon: MapPin, labelEn: "Relocate?", labelDe: "Umziehen?", className: "bottom-12 left-[5%]", delay: "animation-delay-3000" },
  { icon: GraduationCap, labelEn: "Study?", labelDe: "Studieren?", className: "bottom-20 right-[7%]", delay: "animation-delay-2000" },
  { icon: TrendingUp, labelEn: "Invest?", labelDe: "Investieren?", className: "top-1/2 left-[2%]", delay: "animation-delay-5000" },
]

export function HeroSection({
  customQuestion,
  setCustomQuestion,
  onCustomQuestionSubmit
}: HeroSectionProps) {
  const t = useTranslations('hero')
  const locale = useLocale()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)

  const rotatingQuestions = locale === 'de' ? rotatingQuestionsDe : rotatingQuestionsEn

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingQuestions.length)
      setAnimationKey((prev) => prev + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [rotatingQuestions.length])

  const handleSimulateClick = () => {
    const trimmed = customQuestion.trim()
    if (!trimmed) return
    if (trimmed.toLowerCase().startsWith('should i') || trimmed.toLowerCase().startsWith('should')) {
      onCustomQuestionSubmit(trimmed)
    } else {
      onCustomQuestionSubmit(`Should I ${trimmed}?`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSimulateClick()
    }
  }

  return (
    <section className="relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Interactive particle network — desktop only */}
      <div className="absolute inset-0 hidden md:block" style={{ zIndex: 1 }}>
        <InteractiveNetwork particleCount={35} connectionDistance={130} mouseRadius={160} />
      </div>

      {/* Floating question bubbles — desktop only */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none" style={{ zIndex: 2 }}>
        {floatingBubbles.map((bubble, i) => (
          <div
            key={i}
            className={`absolute ${bubble.className} ${bubble.delay} animate-float flex items-center gap-2 rounded-full border border-primary/15 bg-card/60 backdrop-blur-sm px-3 py-1.5 shadow-sm opacity-60`}
          >
            <bubble.icon className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {locale === 'de' ? bubble.labelDe : bubble.labelEn}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4" style={{ zIndex: 3 }}>
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              AI-Powered Decision Analysis
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-base md:text-lg text-muted-foreground lg:text-xl">
            {t('subtitle')}
          </p>

          {/* Rotating example questions */}
          <div className="mb-6 md:mb-8 h-10 flex items-center justify-center">
            <span
              key={animationKey}
              className="animate-fade-slide inline-block text-lg md:text-xl font-semibold gradient-text"
            >
              &ldquo;{rotatingQuestions[currentIndex]}&rdquo;
            </span>
          </div>

          {/* Search bar */}
          <div className="mx-auto mb-4 flex max-w-xl gap-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('inputPlaceholder')}
                className="h-14 pl-12 bg-card text-foreground placeholder:text-muted-foreground text-lg shadow-lg border-2 border-border focus:border-primary"
              />
            </div>
            <Button
              onClick={handleSimulateClick}
              disabled={!customQuestion.trim()}
              className="h-14 px-6 md:px-8 gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="hidden sm:inline">{t('simulate')}</span>
              <ArrowRight className="h-5 w-5 sm:ml-2" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('tryExample')}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            {t('freeHint')}
          </p>
        </div>
      </div>
    </section>
  )
}
