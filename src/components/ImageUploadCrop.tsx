'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Check } from 'lucide-react'
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageUploadCropProps {
    value?: string
    onChange: (imageDataUrl: string) => void
    onRemove: () => void
}

export default function ImageUploadCrop({ value, onChange, onRemove }: ImageUploadCropProps) {
    const [imageSrc, setImageSrc] = useState<string>('')
    const [crop, setCrop] = useState<CropType>({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
    })
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [showCropper, setShowCropper] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Please select an image smaller than 5MB')
                return
            }

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || '')
                setShowCropper(true)
            })
            reader.readAsDataURL(file)
        }
    }

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        
        // Set initial crop to be square and centered
        const size = Math.min(width, height) * 0.9
        const x = (width - size) / 2
        const y = (height - size) / 2
        
        setCrop({
            unit: 'px',
            width: size,
            height: size,
            x,
            y
        })
    }, [])

    const getCroppedImg = useCallback(
        (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                throw new Error('No 2d context')
            }

            // Set canvas size to 1:1 aspect ratio
            const size = 400 // 400x400 pixels for good quality
            canvas.width = size
            canvas.height = size

            // Calculate the scale
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height

            // Draw the cropped image
            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                size,
                size
            )

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Canvas is empty')
                        return
                    }
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(blob)
                }, 'image/jpeg', 0.9)
            })
        },
        []
    )

    const handleCropComplete = async () => {
        if (!imgRef.current || !completedCrop) return

        setIsProcessing(true)
        try {
            const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop)
            onChange(croppedImageUrl)
            setShowCropper(false)
            setImageSrc('')
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Error cropping image:', error)
            alert('Error processing image. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancelCrop = () => {
        setShowCropper(false)
        setImageSrc('')
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-3">
            {/* Upload Area */}
            {!value && !showCropper && (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> an image
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                            <p className="text-xs text-purple-600 font-medium mt-1">
                                Image will be cropped to 1:1 ratio
                            </p>
                        </div>
                    </label>
                </div>
            )}

            {/* Image Preview */}
            {value && !showCropper && (
                <div className="relative">
                    <div className="w-full max-w-xs mx-auto">
                        {/* Square preview container to maintain 1:1 aspect ratio */}
                        <div className="relative w-32 h-32 mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={value}
                                alt="Paunang-Tingin"
                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                                Change Image
                            </button>
                            <button
                                type="button"
                                onClick={onRemove}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="hidden"
                    />
                </div>
            )}

            {/* Cropping Modal */}
            {showCropper && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Crop Image to Square (1:1)
                                </h3>
                                <button
                                    onClick={handleCancelCrop}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Adjust the crop area to select the part of the image you want to use.
                            </p>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-auto">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                className="max-w-full"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    alt="Paunang-tingin ng Crop"
                                    src={imageSrc}
                                    style={{ transform: 'scale(1) rotate(0deg)' }}
                                    onLoad={onImageLoad}
                                    className="max-w-full h-auto"
                                />
                            </ReactCrop>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelCrop}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropComplete}
                                disabled={isProcessing || !completedCrop}
                                className="px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Use Cropped Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
