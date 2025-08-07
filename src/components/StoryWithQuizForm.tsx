'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createStoryWithQuiz, updateStoryQuizItems, type CreateStoryWithQuizData } from '@/actions/quiz'
import { updateStory, type UpdateStoryData } from '@/actions/story'
import { getCategories } from '@/actions/category'
import { isValidVideoFile, formatFileSize } from '@/utils/video'
import { uploadVideoToCloudinaryClient } from '@/utils/cloudinary-client'
import QuizForm from '@/components/QuizForm'
import SubmitButton from '@/components/SubmitButton'

interface Category {
    id: number
    name: string
    description: string | null
}

interface Choice {
    id: number
    text: string
}

interface QuizItem {
    id?: number
    quizNumber: number
    question: string
    choices: Choice[]
    correctAnswer: number | null // id of the correct choice
}

interface StoryWithQuizFormProps {
    story?: {
        id: number
        categoryId?: number
        title: string
        author: string
        description: string | null
        fileLink: string
        subtitles: string[]
        category?: {
            id: number
            name: string
            description: string | null
        }
        QuizItems?: QuizItem[]
    }
    onSuccess?: () => void
    onCancel?: () => void
}

export default function StoryWithQuizForm({ story, onSuccess, onCancel }: StoryWithQuizFormProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [formData, setFormData] = useState({
        title: story?.title || '',
        author: story?.author || '',
        description: story?.description || '',
        fileLink: story?.fileLink || '',
        subtitles: story?.subtitles?.join('\n') || '',
        categoryId: story?.categoryId || story?.category?.id || 1
    })

    const [quizItems, setQuizItems] = useState<QuizItem[]>(
        story?.QuizItems || []
    )

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const isEditing = !!story

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getCategories()
                if (result.success && result.data) {
                    setCategories(result.data)
                }
            } catch (error) {
                console.error('Error sa pag-fetch ng mga kategorya:', error)
            }
        }
        fetchCategories()
    }, [])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Story validation
        if (!formData.title.trim()) {
            newErrors.title = 'Kinakailangan ang pamagat'
        }

        // For new stories, require either video file or existing fileLink
        if (!isEditing) {
            if (!videoFile && !formData.fileLink.trim()) {
                newErrors.fileLink = 'Kinakailangan ang video file'
            }
        } else {
            // For editing, allow keeping existing video if no new file is selected
            if (!videoFile && !formData.fileLink.trim()) {
                newErrors.fileLink = 'Kinakailangan ang video file'
            }
        }

        // Validate video file if provided
        if (videoFile && !isValidVideoFile(videoFile)) {
            newErrors.fileLink = 'Pakipili ang valid na video file (MP4, MOV, AVI, WMV, FLV, WEBM)'
        }

        // Check file size (50MB limit)
        if (videoFile && videoFile.size > 50 * 1024 * 1024) {
            newErrors.fileLink = 'Ang laki ng video file ay dapat na mas mababa sa 50MB'
        }

        // Quiz validation
        if (quizItems.length === 0) {
            newErrors.quiz = 'Kailangan ng kahit isang tanong sa quiz'
        } else {
            for (let i = 0; i < quizItems.length; i++) {
                const item = quizItems[i]

                if (!item.question.trim()) {
                    newErrors.quiz = `Hindi maaaring walang laman ang Tanong ${i + 1}`
                    break
                }

                const validChoices = item.choices.filter(choice => choice.text.trim() !== '')
                if (validChoices.length < 2) {
                    newErrors.quiz = `Ang Tanong ${i + 1} ay dapat may kahit 2 pagpipilian sa sagot`
                    break
                }

                if (!item.correctAnswer || !item.choices.some(choice => choice.id === item.correctAnswer)) {
                    newErrors.quiz = `Ang Tanong ${i + 1} ay dapat may napiling tamang sagot`
                    break
                }
            }
        }

        setErrors(newErrors)

        // Show toast for validation errors
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0]
            toast.error(firstError)
        }

        return Object.keys(newErrors).length === 0
    }

    const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setVideoFile(file)
            // Clear any previous fileLink errors
            if (errors.fileLink) {
                setErrors(prev => ({ ...prev, fileLink: '' }))
            }
        }
    }

    const removeVideoFile = () => {
        setVideoFile(null)
        // Reset the file input
        const fileInput = document.getElementById('videoFile') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            let videoUrl = formData.fileLink

            // Upload video file if provided
            if (videoFile) {
                setIsUploading(true)
                setUploadProgress(0)

                const uploadResult = await uploadVideoToCloudinaryClient(videoFile, (progress) => {
                    setUploadProgress(progress.progress)
                })

                setIsUploading(false)

                if (!uploadResult.success) {
                    const errorMsg = uploadResult.error || 'Hindi na-upload ang video'
                    setErrors({ fileLink: errorMsg })
                    toast.error(errorMsg)
                    return
                }

                videoUrl = uploadResult.url || ''
                toast.success('Matagumpay na na-upload ang video!')
            }

            const subtitlesArray = formData.subtitles
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)

            // Clean up quiz items - remove empty choices and ensure correct numbering
            const cleanedQuizItems = quizItems
                .map((item, index) => ({
                    ...item,
                    quizNumber: index + 1,
                    choices: item.choices.filter(choice => choice.text.trim() !== '')
                }))
                .filter(item => item.correctAnswer !== null) // Only include items with valid correct answers

            let result
            if (isEditing) {
                // Update story data
                const storyData: UpdateStoryData = {
                    title: formData.title.trim(),
                    author: formData.author.trim() || undefined,
                    description: formData.description.trim() || undefined,
                    fileLink: videoUrl.trim(),
                    subtitles: subtitlesArray.length > 0 ? subtitlesArray : undefined,
                    categoryId: formData.categoryId
                }

                const storyResult = await updateStory(story.id, storyData)
                if (!storyResult.success) {
                    const errorMsg = storyResult.error || 'Hindi na-update ang kuwento'
                    setErrors({ general: errorMsg })
                    toast.error(errorMsg)
                    return
                }

                // Update quiz items
                const quizData = cleanedQuizItems.map(item => ({
                    storyId: story.id,
                    quizNumber: item.quizNumber,
                    question: item.question,
                    choices: item.choices,
                    correctAnswer: item.correctAnswer! // We know it's not null due to filtering
                }))

                result = await updateStoryQuizItems(story.id, quizData)
            } else {
                // Create new story with quiz
                const data: CreateStoryWithQuizData = {
                    title: formData.title.trim(),
                    author: formData.author.trim() || undefined,
                    description: formData.description.trim() || undefined,
                    fileLink: videoUrl.trim(),
                    subtitles: subtitlesArray.length > 0 ? subtitlesArray : undefined,
                    categoryId: formData.categoryId,
                    quizItems: cleanedQuizItems.map(item => ({
                        quizNumber: item.quizNumber,
                        question: item.question,
                        choices: item.choices,
                        correctAnswer: item.correctAnswer! // We know it's not null due to filtering
                    }))
                }

                result = await createStoryWithQuiz(data)
            }

            if (result.success) {
                onSuccess?.()
            } else {
                const errorMsg = result.error || 'May naganap na error'
                setErrors({ general: errorMsg })
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'May naganap na hindi inaasahang error'
            setErrors({ general: errorMsg })
            toast.error(errorMsg)
        } finally {
            // setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'categoryId' ? parseInt(value) || 0 : value
        }))

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    const handleQuizItemsChange = (newQuizItems: QuizItem[]) => {
        setQuizItems(newQuizItems)

        // Clear quiz errors when items change
        if (errors.quiz) {
            setErrors(prev => ({
                ...prev,
                quiz: ''
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

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Story Information */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Impormasyon ng Kuwento</h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pamagat ng Kuwento <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ilagay ang pamagat ng kuwento"
                                    disabled={isSubmitting}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                                    May-akda
                                </label>
                                <input
                                    type="text"
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => handleInputChange('author', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ilagay ang pangalan ng may-akda (opsyonal)"
                                    disabled={isSubmitting}
                                />
                                <p className="text-gray-500 text-sm mt-1">
                                    Kapag walang laman, magiging &ldquo;Anonymous&rdquo; ang default
                                </p>
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategorya
                                </label>
                                <select
                                    id="category"
                                    value={formData.categoryId}
                                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-gray-500 text-sm mt-1">
                                    Pumili ng kategorya para makatulong sa pag-organize ng inyong mga kuwento
                                </p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Paglalarawan
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ilagay ang paglalarawan ng kuwento (opsyonal)"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 mb-2">
                                    Video ng Kuwento <span className="text-red-500">*</span>
                                </label>

                                {/* Show current video info if editing and no new file selected */}
                                {isEditing && formData.fileLink && !videoFile && (
                                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-700 mb-2">Kasalukuyang video:</p>
                                        <video
                                            src={formData.fileLink}
                                            className="w-full max-w-xs h-32 object-cover rounded-md mb-2"
                                            controls
                                        />
                                        <p className="text-xs text-blue-600 break-all">{formData.fileLink}</p>
                                    </div>
                                )}

                                {/* Show selected file info */}
                                {videoFile && (
                                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-700">{videoFile.name}</p>
                                                <p className="text-xs text-green-600">{formatFileSize(videoFile.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeVideoFile}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                                disabled={isSubmitting || isUploading}
                                            >
                                                Tanggalin
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    id="videoFile"
                                    accept="video/*"
                                    onChange={handleVideoFile}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fileLink ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isSubmitting || isUploading}
                                />

                                {errors.fileLink && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fileLink}</p>
                                )}

                                <p className="text-gray-500 text-sm mt-1">
                                    Pumili ng video file (MP4, MOV, AVI, WMV, FLV, WEBM). Pinakamataas na laki: 50MB
                                </p>

                                {isUploading && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-blue-600">Nag-uupload ng video...</span>
                                            <span className="text-sm text-blue-600">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                {/* <label htmlFor="subtitles" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subtitles
                                </label> */}
                                <textarea
                                    id="subtitles"
                                    value={formData.subtitles}
                                    onChange={(e) => handleInputChange('subtitles', e.target.value)}
                                    rows={2}
                                    className="hidden w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter subtitles (one line per subtitle, optional)"
                                    disabled={isSubmitting}
                                />
                                {/* <p className="text-gray-500 text-sm mt-1">
                                    Enter each subtitle on a new line. These will be used for text-to-speech on future updates.
                                </p> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Quiz Questions */}
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                        <QuizForm
                            quizItems={quizItems}
                            onQuizItemsChange={handleQuizItemsChange}
                            disabled={isSubmitting}
                        />
                        {errors.quiz && (
                            <p className="text-red-500 text-sm mt-2">{errors.quiz}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <SubmitButton
                    disabled={isSubmitting || isUploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? `Nag-uupload ng Video... ${uploadProgress}%` : (isSubmitting ? 'Sine-save...' : (isEditing ? 'I-update ang Kuwento at Quiz' : 'Gumawa ng Kuwento at Quiz'))}
                </SubmitButton>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting || isUploading}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Kanselahin
                    </button>
                )}
            </div>
        </form>
    )
}
