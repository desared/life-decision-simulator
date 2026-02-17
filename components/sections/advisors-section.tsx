"use client"

import { useTranslations } from 'next-intl'
import { SkillIcon } from "@/lib/skills/skill-icon"

const advisors = [
  { icon: "DollarSign", key: "finance" },
  { icon: "Briefcase", key: "career" },
  { icon: "Heart", key: "health" },
  { icon: "HeartHandshake", key: "relationships" },
  { icon: "GraduationCap", key: "education" },
  { icon: "Home", key: "realEstate" },
  { icon: "MapPin", key: "lifestyle" },
  { icon: "Rocket", key: "business" },
]

export function AdvisorsSection() {
  const t = useTranslations('advisors')

  return (
    <section id="advisors" className="py-20 md:py-32 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {advisors.map((advisor) => (
            <div
              key={advisor.key}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <SkillIcon name={advisor.icon} className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {t(`${advisor.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`${advisor.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
