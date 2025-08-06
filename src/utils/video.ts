// Utility functions for video handling

// Helper function to extract video ID from Cloudinary URL
export function extractCloudinaryVideoId(url: string): string | null {
    try {
        // Cloudinary video URLs typically look like:
        // https://res.cloudinary.com/cloudname/video/upload/v123456789/folder/video_id.mp4
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\./)
        return match ? match[1] : null
    } catch {
        return null
    }
}

// Helper function to generate thumbnail from Cloudinary video URL
export function generateVideoThumbnail(videoUrl: string, options?: {
    width?: number
    height?: number
    quality?: string | number
    startOffset?: string
    crop?: string
    gravity?: string
}): string | null {
    try {
        // For Cloudinary videos, we can generate thumbnails by replacing video/upload with image/upload
        // and adding transformation parameters
        if (videoUrl.includes('res.cloudinary.com') && videoUrl.includes('/video/upload/')) {
            // Default options
            const {
                quality = 'auto',
                startOffset = 'auto', // Cloudinary auto-selects best frame
                crop = 'fill',
                gravity = 'auto'
            } = options || {}

            // Build transformation string
            const transformations = [
                `c_${crop}`,
                `g_${gravity}`,
                `q_${quality}`,
                `so_${startOffset}` // start_offset for frame selection
            ].join(',')

            const thumbnailUrl = videoUrl
                .replace('/video/upload/', `/image/upload/${transformations}/`)
                .replace(/\.(mp4|mov|avi|wmv|flv|webm)$/i, '.jpg')

            return thumbnailUrl
        }
        return null
    } catch {
        return null
    }
}

// Helper function to check if URL is a Cloudinary video
export function isCloudinaryVideo(url: string): boolean {
    return url.includes('res.cloudinary.com') && url.includes('/video/upload/')
}

// Helper function to validate video file types
export function isValidVideoFile(file: File): boolean {
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv', 'video/webm']
    return validTypes.includes(file.type)
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Predefined thumbnail sizes for different use cases
export const THUMBNAIL_SIZES = {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 800, height: 600 },
    square: { width: 300, height: 300 },
    wide: { width: 480, height: 270 }, // 16:9 aspect ratio
    card: { width: 320, height: 240 }   // 4:3 aspect ratio
} as const

// Generate multiple thumbnail sizes for a video
export function generateVideoThumbnails(videoUrl: string, sizes: (keyof typeof THUMBNAIL_SIZES)[] = ['medium']): Record<string, string | null> {
    const thumbnails: Record<string, string | null> = {}

    for (const size of sizes) {
        const dimensions = THUMBNAIL_SIZES[size]
        thumbnails[size] = generateVideoThumbnail(videoUrl, {
            width: dimensions.width,
            height: dimensions.height,
            crop: size === 'square' ? 'fill' : 'fit'
        })
    }

    return thumbnails
}

// Generate thumbnail at specific timestamp
export function generateVideoThumbnailAtTime(videoUrl: string, timeInSeconds: number, options?: {
    width?: number
    height?: number
    quality?: string | number
    crop?: string
    gravity?: string
}): string | null {
    return generateVideoThumbnail(videoUrl, {
        ...options,
        startOffset: timeInSeconds.toString()
    })
}
