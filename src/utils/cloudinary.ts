interface CloudinaryUploadResult {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    resource_type: string
}

export async function uploadImageToCloudinary(
    dataUrl: string, 
    folder: string = 'mystery-box'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Validate that we have a proper data URL
        if (!dataUrl.startsWith('data:image/')) {
            return {
                success: false,
                error: 'Invalid image data format'
            }
        }

        // Prepare the upload request to Cloudinary
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (!cloudName || !apiKey || !apiSecret) {
            return {
                success: false,
                error: 'Cloudinary configuration missing'
            }
        }

        // Create timestamp and signature for authenticated upload
        const timestamp = Math.round(new Date().getTime() / 1000)
        const crypto = await import('crypto')
        
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}&transformation=w_400,h_400,c_fill,q_auto,f_webp`
        const signature = crypto
            .createHash('sha1')
            .update(paramsToSign + apiSecret)
            .digest('hex')

        // Create form data for the upload
        const formData = new FormData()
        formData.append('file', dataUrl)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('folder', folder)
        formData.append('transformation', 'w_400,h_400,c_fill,q_auto,f_webp')

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        )

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Cloudinary API Error:', errorData)
            return {
                success: false,
                error: 'Failed to upload image to Cloudinary'
            }
        }

        const result = await response.json() as CloudinaryUploadResult

        return {
            success: true,
            url: result.secure_url
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload image'
        }
    }
}

export async function deleteImageFromCloudinary(imageUrl: string): Promise<boolean> {
    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Cloudinary configuration missing')
            return false
        }

        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/')
        const publicIdWithExtension = urlParts[urlParts.length - 1]
        const publicId = publicIdWithExtension.split('.')[0]
        
        // Include folder in public_id if it exists
        const folderIndex = urlParts.findIndex(part => part === 'mystery-box')
        let fullPublicId = publicId
        if (folderIndex !== -1) {
            fullPublicId = urlParts.slice(folderIndex).join('/').split('.')[0]
        }

        // Create timestamp and signature for authenticated delete
        const timestamp = Math.round(new Date().getTime() / 1000)
        const crypto = await import('crypto')
        
        const paramsToSign = `public_id=${fullPublicId}&timestamp=${timestamp}`
        const signature = crypto
            .createHash('sha1')
            .update(paramsToSign + apiSecret)
            .digest('hex')

        // Create form data for the delete request
        const formData = new FormData()
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('public_id', fullPublicId)

        // Delete from Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            {
                method: 'POST',
                body: formData,
            }
        )

        return response.ok
    } catch (error) {
        console.error('Cloudinary delete error:', error)
        return false
    }
}
