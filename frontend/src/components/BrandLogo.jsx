import { useId } from 'react'

export default function BrandLogo({
  className = '',
  align = 'left',
  iconClassName = 'w-12 h-12',
  titleClassName = 'text-2xl font-bold text-primary-900',
  subtitleClassName = 'text-xs text-gray-500',
  showSubtitle = true,
}) {
  const gradientId = useId()
  const alignmentClass = align === 'center' ? 'justify-center text-center' : ''

  return (
    <div className={`flex items-center space-x-3 ${alignmentClass} ${className}`.trim()}>
      <div className={`${iconClassName} bg-gradient-to-br from-primary-700 to-gold-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill={`url(#${gradientId})`} />
          <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M24 6C28.5 9 31.5 14.5 31.5 21s-3 12-7.5 15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M24 6C19.5 9 16.5 14.5 16.5 21s3 12 7.5 15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          <line x1="6" y1="24" x2="42" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <path d="M18 20L21 23L27 17" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 28C24 28 20 31 16 28C14 26.5 14 23 16 22C18 21 24 24 24 24C24 24 30 21 32 22C34 23 34 26.5 32 28C28 31 24 28 24 28Z" fill="#FFD700" fillOpacity="0.9" />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <h1 className={titleClassName}>GIAP</h1>
        {showSubtitle && (
          <p className={subtitleClassName}>Global International Assistance Program</p>
        )}
      </div>
    </div>
  )
}
