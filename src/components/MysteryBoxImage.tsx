'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface MysteryBoxImageProps {
    isOpen: boolean
    isCompleted: boolean
    boxNumber?: number
    size?: 'sm' | 'md' | 'lg'
    className?: string
    showStatusIcon?: boolean
    colorVariant?: 'black' | 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'yellow'
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-32 sm:h-32',
    lg: 'w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48'
}

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6 sm:w-8 sm:h-8',
    lg: 'w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12'
}

// const numberSizes = {
//     sm: 'text-sm',
//     md: 'text-lg sm:text-xl',
//     lg: 'text-xl sm:text-2xl lg:text-3xl'
// }

// Color variants for mystery boxes
const colorVariants = {
    black: {
        background: 'bg-gray-900/30',
        shadow: 'shadow-gray-500/30',
        closedImage: 'black_closed.webp',
        openImage: 'black_open.webp'
    },
    blue: {
        background: 'bg-blue-600/30',
        shadow: 'shadow-blue-500/30',
        closedImage: 'blue_closed.webp',
        openImage: 'blue_open.webp'
    },
    green: {
        background: 'bg-green-600/30',
        shadow: 'shadow-green-500/30',
        closedImage: 'green_closed.webp',
        openImage: 'green_open.webp'
    },
    orange: {
        background: 'bg-orange-600/30',
        shadow: 'shadow-orange-500/30',
        closedImage: 'orange_closed.webp',
        openImage: 'orange_open.webp'
    },
    red: {
        background: 'bg-red-600/30',
        shadow: 'shadow-red-500/30',
        closedImage: 'red_closed.webp',
        openImage: 'red_open.webp'
    },
    violet: {
        background: 'bg-violet-600/30',
        shadow: 'shadow-violet-500/30',
        closedImage: 'violet_closed.webp',
        openImage: 'violet_open.webp'
    },
    yellow: {
        background: 'bg-yellow-600/30',
        shadow: 'shadow-yellow-500/30',
        closedImage: 'yellow_closed.webp',
        openImage: 'yellow_open.webp'
    }
}

export default function MysteryBoxImage({
    isOpen,
    isCompleted,
    // boxNumber,
    size = 'lg',
    className = '',
    showStatusIcon = true,
    colorVariant = 'black'
}: MysteryBoxImageProps) {
    const currentVariant = colorVariants[colorVariant]

    // Delayed transition for box state change
    const getTransitionDelay = (isOpening: boolean) => {
        // No delay when opening, but delay when closing to let card fade out first
        return isOpening ? 'delay-50' : 'delay-300';
    }

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Fixed-size container to prevent layout shift */}
            <div className="relative w-full h-full">
                {/* Closed Box Image */}
                <Image
                    src={`/${currentVariant.closedImage}`}
                    alt="Closed mystery box"
                    width={160}
                    height={160}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out will-change-opacity ${isOpen ? `opacity-0 ${getTransitionDelay(false)}` : `opacity-100 ${getTransitionDelay(true)}`
                        }`}
                    priority
                />

                {/* Open Box Image */}
                <Image
                    src={`/${currentVariant.openImage}`}
                    alt="Open mystery box"
                    width={160}
                    height={160}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out will-change-opacity ${isOpen ? `opacity-100 ${getTransitionDelay(true)}` : `opacity-0 ${getTransitionDelay(false)}`
                        }`}
                    priority
                />

                {/* Status Icon Overlay */}
                {showStatusIcon && (
                    <AnimatePresence>
                        {!isOpen && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                className="absolute top-0 right-0 flex items-center justify-center z-10"
                            >
                                {isCompleted && (
                                    <div className="bg-green-500/50 rounded-full p-2 shadow-lg">
                                        <CheckCircle className={`text-white ${iconSizes[size]}`} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
