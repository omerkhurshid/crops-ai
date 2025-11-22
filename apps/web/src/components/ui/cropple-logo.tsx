import React from 'react'
import Image from 'next/image'
interface CroppleLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textColor?: string
}
export function CroppleLogo({ className = '', size = 'md', showText = true, textColor = 'text-[#7A8F78]' }: CroppleLogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
    xl: { icon: 64, text: 'text-4xl' }
  }
  const { icon: iconSize, text: textSize } = sizes[size]
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/crops-ai-logo.png"
        alt="Crops.AI Logo"
        width={iconSize}
        height={iconSize}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={`${textSize} font-medium ${textColor} tracking-tight`}>
          Cropple<span className="font-normal">.ai</span>
        </span>
      )}
    </div>
  )
}