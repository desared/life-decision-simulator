"use client"

import { useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SkillIcon } from "@/lib/skills/skill-icon"

const advisors = [
  { icon: "DollarSign", key: "finance", color: "from-emerald-500/20 to-emerald-500/5" },
  { icon: "Briefcase", key: "career", color: "from-blue-500/20 to-blue-500/5" },
  { icon: "Heart", key: "health", color: "from-rose-500/20 to-rose-500/5" },
  { icon: "HeartHandshake", key: "relationships", color: "from-pink-500/20 to-pink-500/5" },
  { icon: "GraduationCap", key: "education", color: "from-amber-500/20 to-amber-500/5" },
  { icon: "Home", key: "realEstate", color: "from-violet-500/20 to-violet-500/5" },
  { icon: "MapPin", key: "lifestyle", color: "from-teal-500/20 to-teal-500/5" },
  { icon: "Rocket", key: "business", color: "from-orange-500/20 to-orange-500/5" },
]

const iconColors: Record<string, string> = {
  finance: "text-emerald-600 dark:text-emerald-400",
  career: "text-blue-600 dark:text-blue-400",
  health: "text-rose-600 dark:text-rose-400",
  relationships: "text-pink-600 dark:text-pink-400",
  education: "text-amber-600 dark:text-amber-400",
  realEstate: "text-violet-600 dark:text-violet-400",
  lifestyle: "text-teal-600 dark:text-teal-400",
  business: "text-orange-600 dark:text-orange-400",
}

const iconBgColors: Record<string, string> = {
  finance: "bg-emerald-100 dark:bg-emerald-500/20",
  career: "bg-blue-100 dark:bg-blue-500/20",
  health: "bg-rose-100 dark:bg-rose-500/20",
  relationships: "bg-pink-100 dark:bg-pink-500/20",
  education: "bg-amber-100 dark:bg-amber-500/20",
  realEstate: "bg-violet-100 dark:bg-violet-500/20",
  lifestyle: "bg-teal-100 dark:bg-teal-500/20",
  business: "bg-orange-100 dark:bg-orange-500/20",
}

// Duplicate the list for seamless loop
const doubledAdvisors = [...advisors, ...advisors]

function AdvisorCard({ advisor, t, onMouseEnter, onMouseLeave }: {
  advisor: typeof advisors[0]
  t: ReturnType<typeof useTranslations>
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const examples = (t(`${advisor.key}.examples`) as string).split('|')

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative flex-shrink-0 w-[300px] md:w-[320px] rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
    >
      {/* Gradient accent at top */}
      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${advisor.color}`} />

      <div className="flex items-start gap-4 mb-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconBgColors[advisor.key]}`}>
          <SkillIcon name={advisor.icon} className={`h-6 w-6 ${iconColors[advisor.key]}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {t(`${advisor.key}.title`)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(`${advisor.key}.tagline`)}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {t(`${advisor.key}.description`)}
      </p>

      {/* Example questions */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          {t('exampleQuestions')}
        </p>
        {examples.map((example, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />
            <span>{example.trim()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdvisorsSection() {
  const t = useTranslations('advisors')
  const params = useParams()
  const locale = params.locale || 'en'
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  return (
    <section id="advisors" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4 mb-10">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Marquee container with fade edges */}
      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-r from-background to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-l from-background to-transparent" />

        <div
          ref={scrollRef}
          className={`flex gap-4 py-2 marquee-scroll ${isPaused ? 'marquee-paused' : ''}`}
          style={{ width: 'max-content' }}
        >
          {doubledAdvisors.map((advisor, i) => (
            <AdvisorCard
              key={`${advisor.key}-${i}`}
              advisor={advisor}
              t={t}
              onMouseEnter={pause}
              onMouseLeave={resume}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 mt-8 text-center">
        <Link
          href={`/${locale}/advisors`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {t('exploreAll')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <style jsx>{`
        .marquee-scroll {
          animation: marquee 40s linear infinite;
        }
        .marquee-paused {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}
