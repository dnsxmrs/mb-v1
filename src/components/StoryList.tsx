'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getStoriesWithQuiz, deleteStory } from '@/actions/story'
import { getCategories } from '@/actions/category'
import { extractYouTubeVideoId } from '@/utils/youtube'
import StoryWithQuizForm from '@/components/StoryWithQuizForm'
import Modal from '@/components/Modal'

interface Category {
    id: number
    name: string
    description: string | null
    _count: {
        Stories: number
    }
}

interface Story {
    id: number
    categoryId: number
    title: string
    author: string
    description: string | null
    fileLink: string
    subtitles: string[]
    createdAt: Date
    updatedAt: Date
    category?: {
        id: number
        name: string
        description: string | null
    }
    QuizItems?: {
        id: number
        quizNumber: number
        question: string
        choices: {
            id: number
            text: string
        }[]
        correctAnswer: number
    }[]
    _count: {
        QuizItems: number
        Codes: number
        Submissions: number
    }
}

export default function StoryList() {
    const [stories, setStories] = useState<Story[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingStory, setEditingStory] = useState<Story | null>(null)
    const [deletingStory, setDeletingStory] = useState<Story | null>(null)
    const [thumbnails, setThumbnails] = useState<Record<number, string | null>>({})
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    const fetchCategories = async () => {
        try {
            const result = await getCategories()
            if (result.success && result.data) {
                setCategories(result.data)
            } else {
                console.error('Failed to fetch categories:', result.error)
            }
        } catch {
            console.error('An unexpected error occurred while loading categories')
        }
    }

    const fetchStories = async () => {
        setLoading(true)
        try {
            const result = await getStoriesWithQuiz()
            if (result.success && result.data) {
                // Transform the data to match frontend structure
                const transformedStories = result.data.map(story => ({
                    ...story,
                    QuizItems: story.QuizItems?.map(quiz => ({
                        ...quiz,
                        choices: quiz.choices.map((choice) => ({
                            id: choice.id,
                            text: choice.text
                        })),
                        correctAnswer: quiz.choices.find((choice) => choice.text === quiz.correctAnswer)?.id || 1
                    }))
                }))
                setStories(transformedStories)

                // Generate thumbnails for all stories
                const thumbnailMap = result.data.reduce((acc: Record<number, string | null>, story) => {
                    const videoId = extractYouTubeVideoId(story.fileLink)
                    acc[story.id] = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
                    return acc
                }, {} as Record<number, string | null>)

                setThumbnails(thumbnailMap)
                setError('')
            } else {
                const errorMsg = result.error || 'Failed to fetch stories'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'An unexpected error occurred while loading stories'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchStories()
    }, [])

    const handleAddSuccess = () => {
        toast.success('Story and quiz have been created successfully!')
        setShowAddForm(false)
        fetchStories()
    }

    const handleEditSuccess = () => {
        toast.success('Story and quiz have been updated successfully!')
        setEditingStory(null)
        fetchStories()
    }

    const handleDelete = async (story: Story) => {
        try {
            const result = await deleteStory(story.id)
            if (result.success) {
                toast.success(`Story "${story.title}" has been deleted successfully`)
                setDeletingStory(null)
                fetchStories()
            } else {
                toast.error(result.error || 'Failed to delete story')
                setError(result.error || 'Failed to delete story')
            }
        } catch {
            const errorMsg = 'An unexpected error occurred while deleting the story'
            toast.error(errorMsg)
            setError(errorMsg)
        }
    }

    const formatDate = (date: Date) => {
        // Use a more deterministic date formatting to avoid hydration issues
        const d = new Date(date)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }

    if (!mounted) {
        return null
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }        return (
            <div className="space-y-6 text-black">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        {/* <h1 className="text-3xl font-bold text-gray-900">Story Management</h1> */}
                        <p className="text-gray-600 mt-1">Manage your educational stories and content</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Category Filter */}
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category._count.Stories})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Add New Story
                        </button>
                    </div>
                </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Stories Grid */}
            {stories.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
                    <p className="text-gray-600 mb-4">Create your first story to get started</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                    >
                        Add Your First Story
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories
                        .filter(story => selectedCategory === null || story.categoryId === selectedCategory)
                        .map((story) => {
                            const thumbnail = thumbnails[story.id]

                            return (
                            <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Thumbnail */}
                                <div className="relative h-48 bg-gray-200">
                                    {thumbnail ? (
                                        <Image
                                            src={thumbnail}
                                            alt={story.title}
                                            width={400}
                                            height={192}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">🎬</div>
                                                <p className="text-sm">Video Preview</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                        Video
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                                        {story.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-2 italic">
                                        by {story.author}
                                    </p>

                                    {/* Category Badge */}
                                    {story.category && (
                                        <div className="mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {story.category.name}
                                            </span>
                                        </div>
                                    )}

                                    {story.description && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                            {story.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs text-gray-500">
                                        <div>
                                            <div className="font-medium text-gray-700">{story._count.QuizItems}</div>
                                            <div>Quiz Items</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700">{story._count.Codes}</div>
                                            <div>Access Codes</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700">{story._count.Submissions}</div>
                                            <div>Submissions</div>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 mb-4">
                                        Created: {formatDate(story.createdAt)}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingStory(story)}
                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 px-3 rounded-md border border-blue-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingStory(story)}
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 px-3 rounded-md border border-red-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add Story Modal */}
            <Modal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                title="Add New Story & Quiz"
            >
                <StoryWithQuizForm
                    onSuccess={handleAddSuccess}
                    onCancel={() => setShowAddForm(false)}
                />
            </Modal>

            {/* Edit Story Modal */}
            <Modal
                isOpen={!!editingStory}
                onClose={() => setEditingStory(null)}
                title="Edit Story & Quiz"
            >
                {editingStory && (
                    <StoryWithQuizForm
                        story={editingStory}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingStory(null)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingStory}
                onClose={() => setDeletingStory(null)}
                title="Delete Story"
            >
                {deletingStory && (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Are you sure you want to delete &ldquo;<strong>{deletingStory.title}</strong>&rdquo;?
                        </p>
                        <p className="text-red-600 text-sm">
                            This action cannot be undone. All associated quiz items, codes, and submissions will also be deleted.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setDeletingStory(null)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingStory)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                            >
                                Delete Story
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
