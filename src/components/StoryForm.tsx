'use client'

import { useState } from 'react'
import { createStory, updateStory, type CreateStoryData, type UpdateStoryData } from '@/actions/story'
import { isValidYouTubeUrl } from '@/utils/youtube'
import SubmitButton from '@/components/SubmitButton'

interface StoryFormProps {
    story?: {
        id: number
        title: string
        description: string | null
        fileLink: string
        subtitles: string[]
    }
    onSuccess?: () => void
    onCancel?: () => void
}

export default function StoryForm({ story, onSuccess, onCancel }: StoryFormProps) {
    const [formData, setFormData] = useState({
        title: story?.title || '',
        description: story?.description || '',
        fileLink: story?.fileLink || '',
        subtitles: story?.subtitles?.join('\n') || ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditing = !!story

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (!formData.fileLink.trim()) {
            newErrors.fileLink = 'YouTube URL is required'
        } else if (!isValidYouTubeUrl(formData.fileLink)) {
            newErrors.fileLink = 'Please enter a valid YouTube URL'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            const subtitlesArray = formData.subtitles
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)

            const data = {
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                fileLink: formData.fileLink.trim(),
                subtitles: subtitlesArray.length > 0 ? subtitlesArray : undefined
            }

            let result
            if (isEditing) {
                result = await updateStory(story.id, data as UpdateStoryData)
            } else {
                result = await createStory(data as CreateStoryData)
            }

            if (result.success) {
                onSuccess?.()
            } else {
                setErrors({ general: result.error || 'An error occurred' })
            }
        } catch {
            setErrors({ general: 'An unexpected error occurred' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                    </div>
                )}

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Story Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter story title"
                        disabled={isSubmitting}
                    />
                    {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter story description (optional)"
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label htmlFor="fileLink" className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        id="fileLink"
                        value={formData.fileLink}
                        onChange={(e) => handleInputChange('fileLink', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fileLink ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="https://www.youtube.com/watch?v=..."
                        disabled={isSubmitting}
                    />
                    {errors.fileLink && (
                        <p className="text-red-500 text-sm mt-1">{errors.fileLink}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                        Enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </p>
                </div>

                <div>
                    <label htmlFor="subtitles" className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitles
                    </label>
                    <textarea
                        id="subtitles"
                        value={formData.subtitles}
                        onChange={(e) => handleInputChange('subtitles', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter subtitles (one line per subtitle, optional)"
                        disabled={isSubmitting}
                    />
                    <p className="text-gray-500 text-sm mt-1">
                        Enter each subtitle on a new line. These will be used for text-to-speech on future updates.
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    )}

                    <SubmitButton
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Story' : 'Create Story')}
                    </SubmitButton>
                </div>
            </form>
    )
}
