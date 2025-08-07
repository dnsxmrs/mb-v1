'use client'

import Image from 'next/image'

interface VideoThumbnailProps {
    videoUrl: string
    title: string
    className?: string
    width?: number
    height?: number
    quality?: string
    crop?: string
    gravity?: string
    startOffset?: string
}

export default function VideoThumbnail({ 
    videoUrl, 
    title, 
    className = "",
    width = 400,
    height = 300
}: VideoThumbnailProps) {
    // Convert video URL to thumbnail URL by changing extension to jpg
    const getThumbnailUrl = (url: string) => {
        // Check if it's a Cloudinary URL and has .mp4 extension
        if (url.includes('cloudinary.com') && url.endsWith('.mp4')) {
            return url.replace('.mp4', '.webp')
        }
        
        // Fallback: if it's not a video URL, return as is
        return url
    }

    const thumbnailUrl = getThumbnailUrl(videoUrl)

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <Image
                src={thumbnailUrl}
                alt={`Thumbnail para sa ${title}`}
                width={width}
                height={height}
                className="w-full h-full object-cover"
                unoptimized // Since we're using external Cloudinary URLs
                onError={(e) => {
                    // Fallback to a placeholder if thumbnail fails to load
                    const target = e.target as HTMLImageElement
                    target.src = '/images/books.svg'
                }}
            />
        </div>
    )
}
