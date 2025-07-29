'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getStudentViewedStories } from '@/actions/story-view'
import { hasStudentTakenQuiz } from '@/actions/quiz'
import { getCurrentStudentInfo } from '@/actions/student'
import { useStudentSessionRefresh } from '@/hooks/useStudentSession'
// import { updateStudentAuthorizedCode } from '@/actions/student'
import { extractYouTubeVideoId } from '@/utils/youtube'
import { Search } from 'lucide-react'

interface ViewedStory {
    id: number
    title: string
    description: string | null
    author: string
    fileLink: string
    viewedAt: Date
    code: string
}

interface StoryThumbnailProps {
    story: ViewedStory
    quizTaken?: boolean | null
}

function StoryThumbnail({ story, quizTaken }: StoryThumbnailProps) {
    const [hasError, setHasError] = useState(false)

    const getBookThumbnail = (fileLink: string) => {
        // Extract YouTube video ID from the file link
        const videoId = extractYouTubeVideoId(fileLink)

        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }

        // Fallback to placeholder image for non-YouTube videos
        return '/images/books.svg'
    }

    const handleImageLoad = () => {
        setHasError(false)
    }

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const videoId = extractYouTubeVideoId(story.fileLink)
        const target = e.currentTarget as HTMLImageElement

        if (videoId && !hasError) {
            // Try fallback thumbnails in order of quality
            if (target.src.includes('maxresdefault')) {
                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                return
            } else if (target.src.includes('hqdefault')) {
                target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                return
            }
        }

        // Final fallback to placeholder
        setHasError(true)
        target.src = '/images/books.svg'
    }

    return (
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">

            <Image
                src={getBookThumbnail(story.fileLink)}
                alt={`${story.title} thumbnail`}
                fill
                className={`relative z-10 transition-opacity duration-300 ${hasError ? 'w-16 h-16 object-contain opacity-50' : 'object-cover'
                    } 'opacity-100'`}
                onLoad={handleImageLoad}
                onError={handleImageError}
            />

            {/* Semi-transparent overlay for better text readability */}
            <div className="absolute inset-0 bg-black/10 z-20"></div>

            {/* Title overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 z-40">
                <div className="text-white text-sm font-medium line-clamp-2 relative z-50 drop-shadow-lg">
                    {story.title}
                </div>
            </div>

        {/* className="text-white px-3 py-2 border border-[#60A5FA] rounded-lg bg-[#3B82F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#60A5FA] focus:border-[#60A5FA] min-w-[140px]" */}

            {/* Quiz Status badge */}
            {quizTaken !== null && (
                <div className={`absolute top-3 right-3 text-white text-xs px-2 py-1 rounded-full font-medium z-50 shadow-lg ${quizTaken
                    ? 'bg-[#3B82F6]'
                    : 'bg-orange-700'
                    }`}>
                    {quizTaken ? 'Tapos na' : 'May Quiz'}
                </div>
            )}
        </div>
    )
}

type SortOption = 'title-asc' | 'title-desc' | 'latest-first' | 'earliest-first' | 'author-asc' | 'author-desc'

type FilterOption = 'all' | 'with-quiz' | 'without-quiz' | 'quiz-completed' | 'quiz-pending'

export default function StudentLibrary() {
    const [stories, setStories] = useState<ViewedStory[]>([])
    const [filteredStories, setFilteredStories] = useState<ViewedStory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('latest-first')
    const [filterBy, setFilterBy] = useState<FilterOption>('all')
    const [navigating, setNavigating] = useState<string | null>(null) // Track which story is being navigated to
    const [quizStatuses, setQuizStatuses] = useState<Record<string, boolean>>({})
    const { refreshSession } = useStudentSessionRefresh()
    const router = useRouter()

    // Combine data loading into a single effect
    useEffect(() => {
        const loadData = async () => {
            try {
                await refreshSession()
                setLoading(true)
                setError('')

                // Load stories and student info in parallel
                const [studentInfoResult, storiesResult] = await Promise.all([
                    getCurrentStudentInfo(),
                    getStudentViewedStories()
                ])

                if (!storiesResult.success || !storiesResult.data) {
                    setError(storiesResult.error || 'Failed to load viewed stories')
                    return
                }

                setStories(storiesResult.data)

                // Load quiz statuses in parallel if student info is available
                if (studentInfoResult.success && studentInfoResult.data) {
                    const quizPromises = storiesResult.data.map(async (story) => {
                        try {
                            const quizResult = await hasStudentTakenQuiz(
                                story.code,
                                studentInfoResult.data.name,
                                studentInfoResult.data.section,
                                studentInfoResult.data.deviceId || ''
                            )
                            return [story.code, quizResult.success && quizResult.data?.hasTaken || false] as const
                        } catch {
                            return [story.code, false] as const
                        }
                    })

                    const quizResults = await Promise.all(quizPromises)
                    const statuses = Object.fromEntries(quizResults)
                    setQuizStatuses(statuses)
                }
            } catch {
                setError('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [refreshSession])

    // Simplified filtering and sorting logic
    useEffect(() => {
        const processStories = () => {
            let processed = [...stories]

            // Apply search filter first (most selective)
            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase()
                processed = processed.filter(story =>
                    story.title.toLowerCase().includes(searchLower) ||
                    story.author.toLowerCase().includes(searchLower) ||
                    story.description?.toLowerCase().includes(searchLower)
                )
            }

            // Apply category filter
            if (filterBy !== 'all') {
                processed = processed.filter(story => {
                    const hasQuiz = story.code in quizStatuses
                    const quizTaken = quizStatuses[story.code]

                    switch (filterBy) {
                        case 'with-quiz': return hasQuiz
                        case 'without-quiz': return !hasQuiz
                        case 'quiz-completed': return quizTaken === true
                        case 'quiz-pending': return hasQuiz && quizTaken === false
                        default: return true
                    }
                })
            }

            // Apply sorting
            if (sortBy !== 'latest-first') { // Skip sorting if default
                processed.sort((a, b) => {
                    switch (sortBy) {
                        case 'title-asc': return a.title.localeCompare(b.title)
                        case 'title-desc': return b.title.localeCompare(a.title)
                        case 'earliest-first': return new Date(a.viewedAt).getTime() - new Date(b.viewedAt).getTime()
                        case 'author-asc': return a.author.localeCompare(b.author)
                        case 'author-desc': return b.author.localeCompare(a.author)
                        default: return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
                    }
                })
            } else {
                // Default sort by latest first
                processed.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
            }

            setFilteredStories(processed)
        }

        processStories()
    }, [stories, searchTerm, sortBy, filterBy, quizStatuses])

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('tl-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila',
        }).format(new Date(date))
    }

    const handleStoryClick = async (storyCode: string) => {
        try {
            // Set loading state for this specific story
            setNavigating(storyCode)

            // Update the authorized code in the student session
            // const result = await updateStudentAuthorizedCode(storyCode)

            // if (result.success) {
            //     // Navigate to the story page
            router.push(`/student/story/${storyCode}`)
            // } else {
            //     console.error('Failed to update authorized code:', result.error)
            //     // Still navigate even if update fails (fallback)
            //     router.push(`/student/story/${storyCode}`)
            // }
        } catch (error) {
            console.error('Error updating authorized code:', error)
            // Still navigate even if update fails (fallback)
            router.push(`/student/story/${storyCode}`)
        } finally {
            // Clear loading state
            setNavigating(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
                <span className="ml-3 text-[#1E3A8A]">Loading your library...</span>
            </div>
        )
    }

    if (error && error !== 'No student session found') {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <p className="text-red-600">{error}</p>
            </div>
        )
    }

    if (stories.length === 0) {
        return (
            <div className="text-[#1E3A8A] text-center py-12">
                <div className="mb-4">
                    <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Walang Panitikan na Nahanap</h3>
                <p>Wala ka pang na-view na panitikan. Simulan ang pag-explore upang bumuo ng iyong aklatan!</p>
            </div>
        )
    }

    return (
        <div className="text-[#1E3A8A] space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#1E3A8A] mb-2">Iyong Aklatan</h2>
                <p className="text-xl">Mga panitikang iyong na-explore at nagustuhan</p>
            </div>

            {/* Smart Search Bar with Inline Filters - Only show when there are stories */}
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
                    {/* Search Bar */}
                    <div className="relative w-full lg:flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#60A5FA] z-10" />
                        </div>
                        <input
                            type="text"
                            placeholder="Hanapin ang panitikan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-[#1E3A8A] block w-full pl-10 pr-10 py-2 bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#3B82F6] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="h-5 w-5 text-[#60A5FA] hover:text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Sort and Filter Container - adjusts layout based on screen size */}
                    <div className="flex flex-col sm:flex-row lg:flex-row gap-4 items-center justify-center w-full lg:w-auto">
                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-[#1E3A8A] whitespace-nowrap">
                                Sort:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="text-white px-3 py-2 border border-[#60A5FA] rounded-lg bg-[#3B82F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#60A5FA] focus:border-[#60A5FA] min-w-[140px]"
                            >
                                <option value="latest-first">Pinakabago</option>
                                <option value="earliest-first">Pinakaluma</option>
                                <option value="title-asc">Pamagat (A-Z)</option>
                                <option value="title-desc">Pamagat (Z-A)</option>
                                <option value="author-asc">May-akda (A-Z)</option>
                                <option value="author-desc">May-akda (Z-A)</option>
                            </select>
                        </div>

                        {/* Filter Controls */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-[#1E3A8A] whitespace-nowrap">
                                Filter:
                            </label>
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                className="text-white px-3 py-2 border border-[#60A5FA] rounded-lg bg-[#3B82F6] text-sm focus:outline-none focus:ring-1 focus:ring-[#60A5FA] focus:border-[#60A5FA] min-w-[140px]"
                            >
                                <option value="all">Lahat</option>
                                <option value="with-quiz">May Quiz</option>
                                <option value="quiz-completed">Tapos na ang Quiz</option>
                                <option value="quiz-pending">Hindi pa tapos ang Quiz</option>
                                <option value="without-quiz">Walang Quiz</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditional Results Display */}
            {filteredStories.length === 0 && searchTerm ? (
                /* No Search Results */
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Walang nahanap na panitikan</h3>
                    <p className="text-gray-500">Subukan ang paghahanap gamit ang ibang mga keyword o i-clear ang paghahanap upang makita ang lahat ng panitikan.</p>
                </div>
            ) : (
                /* Stories Grid */
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStories.map((story) => (
                            <div
                                key={`${story.id}-${story.code}`}
                                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100 ${navigating === story.code ? 'opacity-75 pointer-events-none' : ''
                                    }`}
                                onClick={() => handleStoryClick(story.code)}
                            >
                                {/* Loading overlay when navigating */}
                                {navigating === story.code && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                                            <span className="text-[#1E3A8A] font-medium">Binubuksan ang kwento...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Book Cover/Thumbnail */}
                                <StoryThumbnail
                                    story={story}
                                    quizTaken={quizStatuses[story.code] ?? null}
                                />

                                {/* Book Details */}
                                <div className="p-4 bg-white">
                                    <h3 className="font-bold text-[#1E3A8A] text-base mb-1 line-clamp-2" title={story.title}>
                                        {story.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2 font-medium" title={story.author}>
                                        ni {story.author}
                                    </p>
                                    {story.description && (
                                        <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed" title={story.description}>
                                            {story.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center text-xs text-gray-400">
                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatDate(story.viewedAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Results Summary */}
                    <div className="text-center mt-8 text-gray-500 text-sm">
                        {searchTerm && ` na tumugma sa "${searchTerm}"`}
                        {filterBy !== 'all' && ` (${filterBy === 'with-quiz' ? 'may quiz' :
                            filterBy === 'quiz-completed' ? 'tapos na ang quiz' :
                                filterBy === 'quiz-pending' ? 'hindi pa tapos ang quiz' :
                                    'walang quiz'
                            })`}
                    </div>
                </>
            )}
        </div>
    )
}
