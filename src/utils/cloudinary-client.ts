// Client-side Cloudinary upload utilities
'use client'

/* 
Required Environment Variables:
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: An unsigned upload preset configured in your Cloudinary dashboard

To set up the upload preset:
1. Go to your Cloudinary Console -> Settings -> Upload
2. Add an upload preset
3. Set it to "Unsigned"
4. Configure folder, transformations, and other settings as needed
5. Save and use the preset name in your environment variables
*/

interface CloudinaryUploadResult {
    public_id: string
    secure_url: string
    width?: number
    height?: number
    format: string
    resource_type: string
    bytes: number
    duration?: number
}

interface UploadProgress {
    loaded: number
    total: number
    progress: number
}

export async function uploadVideoToCloudinaryClient(
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Validate file type
        if (!file.type.startsWith('video/')) {
            return {
                success: false,
                error: 'Please select a valid video file'
            }
        }

        // Check file size (limit to 50MB for videos)
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'Video file size must be less than 50MB'
            }
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            return {
                success: false,
                error: 'Cloudinary configuration missing'
            }
        }

        // Create form data for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)
        formData.append('folder', 'story-videos')
        formData.append('resource_type', 'video')

        // Upload to Cloudinary using XMLHttpRequest for progress tracking
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest()

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100)
                    onProgress({
                        loaded: event.loaded,
                        total: event.total,
                        progress
                    })
                }
            })

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const result: CloudinaryUploadResult = JSON.parse(xhr.responseText)
                        resolve({
                            success: true,
                            url: result.secure_url
                        })
                    } catch (error) {
                        console.error('Error parsing Cloudinary response:', error)
                        resolve({
                            success: false,
                            error: 'Failed to parse upload response'
                        })
                    }
                } else {
                    console.error('Cloudinary upload failed:', xhr.responseText)
                    resolve({
                        success: false,
                        error: `Upload failed with status ${xhr.status}`
                    })
                }
            })

            xhr.addEventListener('error', () => {
                resolve({
                    success: false,
                    error: 'Network error during upload'
                })
            })

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`)
            xhr.send(formData)
        })
    } catch (error) {
        console.error('Client-side upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload video'
        }
    }
}

export async function uploadImageToCloudinaryClient(
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'Please select a valid image file'
            }
        }

        // Check file size (limit to 10MB for images)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'Image file size must be less than 10MB'
            }
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            return {
                success: false,
                error: 'Cloudinary configuration missing'
            }
        }

        // Create form data for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)
        formData.append('folder', 'story-images')

        // Upload to Cloudinary using XMLHttpRequest for progress tracking
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest()

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100)
                    onProgress({
                        loaded: event.loaded,
                        total: event.total,
                        progress
                    })
                }
            })

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const result: CloudinaryUploadResult = JSON.parse(xhr.responseText)
                        resolve({
                            success: true,
                            url: result.secure_url
                        })
                    } catch (error) {
                        console.error('Error parsing Cloudinary response:', error)
                        resolve({
                            success: false,
                            error: 'Failed to parse upload response'
                        })
                    }
                } else {
                    console.error('Cloudinary upload failed:', xhr.responseText)
                    resolve({
                        success: false,
                        error: `Upload failed with status ${xhr.status}`
                    })
                }
            })

            xhr.addEventListener('error', () => {
                resolve({
                    success: false,
                    error: 'Network error during upload'
                })
            })

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
            xhr.send(formData)
        })
    } catch (error) {
        console.error('Client-side upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload image'
        }
    }
}
