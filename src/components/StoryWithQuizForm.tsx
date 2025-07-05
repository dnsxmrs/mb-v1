'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createStoryWithQuiz, updateStoryQuizItems, type CreateStoryWithQuizData } from '@/actions/quiz'
import { updateStory, type UpdateStoryData } from '@/actions/story'
import { isValidYouTubeUrl } from '@/utils/youtube'
import QuizForm from '@/components/QuizForm'
import SubmitButton from '@/components/SubmitButton'


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
        title: string
        author: string
        description: string | null
        fileLink: string
        subtitles: string[]
        QuizItems?: QuizItem[]
    }
    onSuccess?: () => void
    onCancel?: () => void
}

export default function StoryWithQuizForm({ story, onSuccess, onCancel }: StoryWithQuizFormProps) {
    const [formData, setFormData] = useState({
        title: story?.title || '',
        author: story?.author || '',
        description: story?.description || '',
        fileLink: story?.fileLink || '',
        subtitles: story?.subtitles?.join('\n') || ''
    })

    const [quizItems, setQuizItems] = useState<QuizItem[]>(
        story?.QuizItems || []
    )

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditing = !!story

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Story validation
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (!formData.fileLink.trim()) {
            newErrors.fileLink = 'YouTube URL is required'
        } else if (!isValidYouTubeUrl(formData.fileLink)) {
            newErrors.fileLink = 'Please enter a valid YouTube URL'
        }

        // Quiz validation
        if (quizItems.length === 0) {
            newErrors.quiz = 'At least one quiz question is required'
        } else {
            for (let i = 0; i < quizItems.length; i++) {
                const item = quizItems[i]

                if (!item.question.trim()) {
                    newErrors.quiz = `Question ${i + 1} cannot be empty`
                    break
                }

                const validChoices = item.choices.filter(choice => choice.text.trim() !== '')
                if (validChoices.length < 2) {
                    newErrors.quiz = `Question ${i + 1} must have at least 2 answer choices`
                    break
                }

                if (!item.correctAnswer || !item.choices.some(choice => choice.id === item.correctAnswer)) {
                    newErrors.quiz = `Question ${i + 1} must have a correct answer selected`
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
                    fileLink: formData.fileLink.trim(),
                    subtitles: subtitlesArray.length > 0 ? subtitlesArray : undefined
                }

                const storyResult = await updateStory(story.id, storyData)
                if (!storyResult.success) {
                    const errorMsg = storyResult.error || 'Failed to update story'
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
                    fileLink: formData.fileLink.trim(),
                    subtitles: subtitlesArray.length > 0 ? subtitlesArray : undefined,
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
                const errorMsg = result.error || 'An error occurred'
                setErrors({ general: errorMsg })
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'An unexpected error occurred'
            setErrors({ general: errorMsg })
            toast.error(errorMsg)
        } finally {
            // setIsSubmitting(false)
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Story Information</h3>

                        <div className="space-y-4">
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
                                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => handleInputChange('author', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter author name (optional)"
                                    disabled={isSubmitting}
                                />
                                <p className="text-gray-500 text-sm mt-1">
                                    If left empty, will default to &ldquo;Anonymous&rdquo;
                                </p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={2}
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
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter subtitles (one line per subtitle, optional)"
                                    disabled={isSubmitting}
                                />
                                <p className="text-gray-500 text-sm mt-1">
                                    Enter each subtitle on a new line. These will be used for text-to-speech on future updates.
                                </p>
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
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : (isEditing ? 'Update Story & Quiz' : 'Create Story & Quiz')}
                </SubmitButton>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}
