'use client'

import { useState, useEffect } from 'react'
import { getStoriesWithQuiz } from '@/actions/story'
import { getQuizItemsByStory } from '@/actions/quiz'

interface Choice {
    id: number
    createdAt: Date
    updatedAt: Date
    text: string
    quizItemId: number
}

interface QuizItem {
    id: number
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    quizNumber: number
    storyId: number
    question: string
    correctAnswer: string
    choices: Choice[]
}

interface Story {
    id: number
    title: string
    description: string | null
    fileLink: string
    subtitles: string[]
    createdAt: Date
    updatedAt: Date
    QuizItems?: QuizItem[]
    _count: {
        QuizItems: number
        Codes: number
        Submissions: number
    }
}

export default function QuizManagement() {
    const [stories, setStories] = useState<Story[]>([])
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    const fetchStories = async () => {
        setLoading(true)
        try {
            const result = await getStoriesWithQuiz()
            if (result.success && result.data) {
                setStories(result.data)
                setError('')
            } else {
                setError(result.error || 'Failed to fetch stories')
            }
        } catch {
            setError('An unexpected error occurred')
        } finally {
            // setLoading(false)
        }
    }

    useEffect(() => {
        fetchStories()
    }, [])

    const handleStorySelect = async (story: Story) => {
        if (story.id === selectedStory?.id) {
            setSelectedStory(null)
            return
        }

        try {
            const result = await getQuizItemsByStory(story.id)
            if (result.success && result.data) {
                setSelectedStory({
                    ...story,
                    QuizItems: result.data
                })
            } else {
                setError(result.error || 'Failed to fetch quiz items')
            }
        } catch {
            setError('Failed to fetch quiz items')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
                <p className="text-gray-600 mt-1">View and manage quiz questions for your stories</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Stories List */}
            {stories.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No stories with quizzes found</h3>
                    <p className="text-gray-600">Create stories with quizzes to see them here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stories Panel */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Stories</h2>
                            <p className="text-gray-600 text-sm">Click on a story to view its quiz questions</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {stories.map((story) => (
                                <div
                                    key={story.id}
                                    onClick={() => handleStorySelect(story)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedStory?.id === story.id ? 'bg-blue-50 border-blue-200' : ''
                                    }`}
                                >
                                    <h3 className="font-semibold text-gray-900 mb-2">{story.title}</h3>
                                    {story.description && (
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{story.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{story._count.QuizItems} quiz questions</span>
                                        <span>{story._count.Codes} access codes</span>
                                        <span>{story._count.Submissions} submissions</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quiz Questions Panel */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {selectedStory ? `Quiz Questions: ${selectedStory.title}` : 'Quiz Questions'}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {selectedStory ? 'Review the quiz questions for this story' : 'Select a story to view its quiz questions'}
                            </p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {!selectedStory ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">❓</div>
                                    <p>Select a story from the left to view its quiz questions</p>
                                </div>
                            ) : selectedStory.QuizItems && selectedStory.QuizItems.length > 0 ? (
                                <div className="p-4 space-y-4">
                                    {selectedStory.QuizItems.map((quizItem) => (
                                        <div key={quizItem.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                                                    Q{quizItem.quizNumber}
                                                </span>
                                                <h3 className="font-medium text-gray-900 flex-1">
                                                    {quizItem.question}
                                                </h3>
                                            </div>
                                            <div className="space-y-2">
                                                {quizItem.choices.map((choice, choiceIndex) => (
                                                    <div
                                                        key={choice.id}
                                                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                                                            choice.text === quizItem.correctAnswer
                                                                ? 'bg-green-50 text-green-800 border border-green-200'
                                                                : 'bg-gray-50 text-gray-700'
                                                        }`}
                                                    >
                                                        <span className="font-medium">
                                                            {String.fromCharCode(65 + choiceIndex)}.
                                                        </span>
                                                        <span>{choice.text}</span>
                                                        {choice.text === quizItem.correctAnswer && (
                                                            <span className="ml-auto text-green-600 font-medium">✓ Correct</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">❓</div>
                                    <p>No quiz questions found for this story</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}