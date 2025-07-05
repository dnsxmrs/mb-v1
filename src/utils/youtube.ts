// Utility functions for YouTube URL handling
// These are client-side utilities, not server actions

// Helper function to extract YouTube video ID from URL
export function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            return match[1]
        }
    }

    return null
}

// Helper function to validate YouTube URL
export function isValidYouTubeUrl(url: string): boolean {
    return extractYouTubeVideoId(url) !== null
}

// Helper function to convert YouTube URLs to embeddable format
export function convertToEmbedUrl(url: string): string {
    try {
        const videoId = extractYouTubeVideoId(url);
        
        if (!videoId) {
            return url; // Return original URL if not a YouTube URL
        }
        
        // Use youtube-nocookie.com for better privacy and to avoid connection issues
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
    } catch (error) {
        console.error('Error converting YouTube URL:', error);
        return url;
    }
}
