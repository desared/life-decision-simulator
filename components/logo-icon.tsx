interface LogoIconProps {
  className?: string
}

export function LogoIcon({ className = "h-5 w-5" }: LogoIconProps) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M72 62C72 47.088 84.088 35 99 35h0c14.912 0 27 12.088 27 27 0 14.912-12.088 27-27 27h-9v18" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="90" cy="143" r="10" fill="currentColor" />
    </svg>
  )
}
