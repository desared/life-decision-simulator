"use client"

import {
  DollarSign,
  Briefcase,
  Heart,
  HeartHandshake,
  GraduationCap,
  Home,
  MapPin,
  Rocket,
  HelpCircle,
  type LucideProps,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  DollarSign,
  Briefcase,
  Heart,
  HeartHandshake,
  GraduationCap,
  Home,
  MapPin,
  Rocket,
  HelpCircle,
}

export function SkillIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = iconMap[name] ?? HelpCircle
  return <Icon {...props} />
}
