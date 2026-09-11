'use client'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
}

export default function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  }

  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Logo Mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="logo-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
        {/* Document shape */}
        <path
          d="M12 10.5C12 9.67 12.67 9 13.5 9H21L28 16V29.5C28 30.33 27.33 31 26.5 31H13.5C12.67 31 12 30.33 12 29.5V10.5Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Fold corner */}
        <path
          d="M21 9V15C21 15.55 21.45 16 22 16H28"
          fill="url(#logo-highlight)"
          fillOpacity="0.3"
        />
        {/* Invoice lines */}
        <rect x="15" y="19" width="10" height="1.5" rx="0.75" fill="url(#logo-gradient)" fillOpacity="0.6" />
        <rect x="15" y="23" width="7" height="1.5" rx="0.75" fill="url(#logo-gradient)" fillOpacity="0.4" />
        <rect x="15" y="27" width="12" height="1.5" rx="0.75" fill="url(#logo-gradient)" fillOpacity="0.3" />
      </svg>
      {/* Wordmark */}
      {variant === 'full' && (
        <span className={`font-display font-bold tracking-tight text-surface-900 ${s.text}`}>
          Invoice<span className="text-primary-600">Craft</span>
        </span>
      )}
    </div>
  )
}
