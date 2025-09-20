import React from 'react'

interface CroppleLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textColor?: string
}

export function CroppleLogo({ className = '', size = 'md', showText = true, textColor = 'text-green-700' }: CroppleLogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
    xl: { icon: 64, text: 'text-4xl' }
  }

  const { icon: iconSize, text: textSize } = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative`} style={{ width: iconSize, height: iconSize }}>
        <svg 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer circle */}
          <circle cx="100" cy="100" r="95" stroke="#22A55F" strokeWidth="10" fill="white"/>
          
          {/* Farm fields (curved lines) */}
          <path d="M 30 140 Q 100 120 170 140" stroke="#22A55F" strokeWidth="8" fill="none"/>
          <path d="M 30 160 Q 100 140 170 160" stroke="#22A55F" strokeWidth="8" fill="none"/>
          <path d="M 30 180 Q 100 160 170 180" stroke="#22A55F" strokeWidth="8" fill="none"/>
          
          {/* Barn */}
          <rect x="45" y="80" width="50" height="40" fill="#22A55F"/>
          <polygon points="45,80 70,55 95,80" fill="#22A55F"/>
          <rect x="60" y="90" width="20" height="30" fill="white"/>
          {/* Barn door cross pattern */}
          <line x1="60" y1="90" x2="80" y2="110" stroke="#22A55F" strokeWidth="2"/>
          <line x1="80" y1="90" x2="60" y2="110" stroke="#22A55F" strokeWidth="2"/>
          
          {/* Tree */}
          <rect x="140" y="90" width="10" height="30" fill="#22A55F"/>
          <circle cx="145" cy="85" r="20" fill="#22A55F"/>
          
          {/* Sun */}
          <circle cx="110" cy="40" r="8" fill="none" stroke="#22A55F" strokeWidth="3"/>
          <g transform="translate(110, 40)">
            <line x1="0" y1="-12" x2="0" y2="-18" stroke="#22A55F" strokeWidth="3"/>
            <line x1="8.5" y1="-8.5" x2="12.7" y2="-12.7" stroke="#22A55F" strokeWidth="3"/>
            <line x1="12" y1="0" x2="18" y2="0" stroke="#22A55F" strokeWidth="3"/>
            <line x1="8.5" y1="8.5" x2="12.7" y2="12.7" stroke="#22A55F" strokeWidth="3"/>
            <line x1="0" y1="12" x2="0" y2="18" stroke="#22A55F" strokeWidth="3"/>
            <line x1="-8.5" y1="8.5" x2="-12.7" y2="12.7" stroke="#22A55F" strokeWidth="3"/>
            <line x1="-12" y1="0" x2="-18" y2="0" stroke="#22A55F" strokeWidth="3"/>
            <line x1="-8.5" y1="-8.5" x2="-12.7" y2="-12.7" stroke="#22A55F" strokeWidth="3"/>
          </g>
          
          {/* Clouds */}
          <circle cx="130" cy="45" r="8" fill="#22A55F" opacity="0.3"/>
          <circle cx="140" cy="48" r="6" fill="#22A55F" opacity="0.3"/>
          <circle cx="135" cy="52" r="5" fill="#22A55F" opacity="0.3"/>
        </svg>
      </div>
      
      {showText && (
        <span className={`${textSize} font-medium ${textColor} tracking-tight`}>
          cropple<span className="font-normal">.ai</span>
        </span>
      )}
    </div>
  )
}