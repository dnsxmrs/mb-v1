'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getStoriesWithQuiz, deleteStory } from '@/actions/story'
import { getCategories } from '@/actions/category'
import StoryWithQuizForm from '@/components/StoryWithQuizForm'
import VideoThumbnail from '@/components/VideoThumbnail'
import Modal from '@/components/Modal'
import { Plus, Pen, Trash } from 'lucide-react'

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
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        fetchCategories()
        fetchStories()
    }, [])

    const fetchCategories = async () => {
        try {
            const result = await getCategories()
            if (result.success && result.data) {
                setCategories(result.data)
            } else {
                console.error('Hindi na-fetch ang mga kategorya:', result.error)
            }
        } catch {
            console.error('May naganap na hindi inaasahang error habang nilo-load ang mga kategorya')
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
                setError('')
            } else {
                const errorMsg = result.error || 'Hindi na-fetch ang mga kuwento'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'May naganap na hindi inaasahang error habang nilo-load ang mga kuwento'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSuccess = () => {
        toast.success('Ang kuwento at quiz ay na-create na ng matagumpay!')
        setShowAddForm(false)
        fetchStories()
    }

    const handleEditSuccess = () => {
        toast.success('Ang kuwento at quiz ay na-update na ng matagumpay!')
        setEditingStory(null)
        fetchStories()
    }

    const handleDelete = async (story: Story) => {
        try {
            const result = await deleteStory(story.id)
            if (result.success) {
                toast.success(`Ang kuwentong "${story.title}" ay na-delete na ng matagumpay`)
                setDeletingStory(null)
                fetchStories()
            } else {
                toast.error(result.error || 'Hindi na-delete ang kuwento')
                setError(result.error || 'Hindi na-delete ang kuwento')
            }
        } catch {
            const errorMsg = 'May naganap na hindi inaasahang error habang dine-delete ang kuwento'
            toast.error(errorMsg)
            setError(errorMsg)
        }
    }

    const formatDate = (date: Date) => {
        // Use a more deterministic date formatting to avoid hydration issues
        const d = new Date(date)
        const months = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre']
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
    }

    return (
        <div className="space-y-4 sm:space-y-6 text-black px-2 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pamamahala ng Kuwento</h1>
                        <p className="text-gray-600">Pamahalaan ang inyong mga pang-edukasyong kuwento at nilalaman</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-2 sm:px-0">
                    {/* Category Filter */}
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base w-full sm:w-auto"
                    >
                        <option value="">Lahat ng Kategorya</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name} ({category._count.Stories})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base whitespace-nowrap"
                    >
                        <Plus className="inline-block mr-1" size={16} />
                        Magdagdag ng Bagong Kuwento
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
            {(() => {
                const filteredStories = stories.filter(story => selectedCategory === null || story.categoryId === selectedCategory);

                if (stories.length === 0) {
                    return (
                        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
                            <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Wala pang mga kuwento</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 px-2">Gumawa ng inyong unang kuwento para makapagsimula</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm sm:text-base"
                            >
                                Magdagdag ng Inyong Unang Kuwento
                            </button>
                        </div>
                    );
                }

                if (filteredStories.length === 0 && selectedCategory !== null) {
                    const categoryName = categories.find(cat => cat.id === selectedCategory)?.name || 'this category';
                    return (
                        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
                            <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📖</div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Walang mga kuwento sa {categoryName}</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 px-2">Wala pang mga kuwentong available sa kategoryang ito</p>
                            {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md text-sm sm:text-base"
                                >
                                    View All Stories
                                </button>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm sm:text-base"
                                >
                                    Add New Story
                                </button>
                            </div> */}
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
                        {filteredStories.map((story) => (
                            <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-fit">
                                {/* Thumbnail */}
                                <div className="relative h-40 sm:h-48">
                                    <VideoThumbnail
                                        videoUrl={story.fileLink}
                                        title={story.title}
                                        className="w-full h-full"
                                        width={400}
                                        height={300}
                                        quality="auto"
                                        crop="fill"
                                        gravity="auto"
                                        startOffset="auto"
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded">
                                        {/* Category Badge */}
                                        {story.category && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {story.category.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                    {/* Content */}
                                    <div className="p-3 sm:p-4 flex flex-col">
                                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 line-clamp-2">
                                            {story.title}
                                        </h3>

                                        <p className="text-gray-500 text-xs sm:text-sm mb-2 italic">
                                            ni {story.author}
                                        </p>

                                        {story.description && (
                                            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-3 flex-grow">
                                                {story.description}
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-500 mb-3 sm:mb-4">
                                            Ginawa: {formatDate(story.createdAt)}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-row justify-center gap-4 sm:gap-8 mb-3 sm:mb-4 text-center text-xs text-gray-500">
                                            <div>
                                                <div className="font-medium text-gray-700">{story._count.QuizItems}</div>
                                                <div className="text-xs">Mga Quiz Item</div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-700">{story._count.Codes}</div>
                                                <div className="text-xs">Mga Access Code</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => setEditingStory(story)}
                                                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-md border border-blue-200"
                                            >
                                                <Pen className="inline-block mr-2" size={16} />
                                                I-edit
                                            </button>
                                            <button
                                                onClick={() => setDeletingStory(story)}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-md border border-red-200"
                                            >
                                                <Trash className="inline-block mr-2" size={16} />
                                                Tanggalin
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        ))}
                    </div>
                );
            })()}

            {/* Add Story Modal */}
            <Modal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                title="Magdagdag ng Bagong Kuwento at Quiz"
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
                title="I-edit ang Kuwento at Quiz"
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
                title="Tanggalin ang Kuwento"
            >
                {deletingStory && (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Sigurado ba kayong gusto ninyong tanggalin ang &ldquo;<strong>{deletingStory.title}</strong>&rdquo;?
                        </p>
                        <p className="text-red-600 text-sm">
                            Hindi na mababalik ang aksyong ito. Lahat ng mga kaugnay na quiz item, code, at submission ay matatanggal din.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setDeletingStory(null)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
                            >
                                Kanselahin
                            </button>
                            <button
                                onClick={() => handleDelete(deletingStory)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                            >
                                Tanggalin ang Kuwento
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
