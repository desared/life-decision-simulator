"use client"

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectScenario: (id: string) => void
  onPremiumClick: () => void
  placeholder: string
}

export function SearchAutocomplete({
  value,
  onChange,
  placeholder
}: SearchAutocompleteProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 pl-12 bg-card text-foreground placeholder:text-muted-foreground text-lg shadow-lg border-2 border-border focus:border-primary"
      />
    </div>
  )
}
