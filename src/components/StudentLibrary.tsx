'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getStudentViewedStories } from '@/actions/story-view'
import { useStudentSessionRefresh } from '@/hooks/useStudentSession'
import { updateStudentAuthorizedCode } from '@/actions/student'
import { extractYouTubeVideoId } from '@/utils/youtube'

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
}

function StoryThumbnail({ story }: StoryThumbnailProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const getBookThumbnail = (fileLink: string) => {
        // Extract YouTube video ID from the file link
        const videoId = extractYouTubeVideoId(fileLink)

        if (videoId) {
            // Use YouTube's thumbnail service - maxresdefault provides the highest quality
            // Will fallback to lower quality thumbnails if maxres is not available
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }

        // Fallback to placeholder image for non-YouTube videos
        return '/images/books.svg'
    }

    const handleImageLoad = () => {
        setIsLoading(false)
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
        setIsLoading(false)
        target.src = '/images/books.svg'
    }

    return (
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8"></div>
                </div>
            )}

            <Image
                src={getBookThumbnail(story.fileLink)}
                alt={`${story.title} thumbnail`}
                fill
                className={`relative z-10 transition-opacity duration-300 ${hasError ? 'w-16 h-16 object-contain opacity-50' : 'object-cover'
                    } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
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

            {/* Reading badge */}
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium z-50 shadow-lg">
                Read
            </div>
        </div>
    )
}

export default function StudentLibrary() {
    const [stories, setStories] = useState<ViewedStory[]>([])
    const [filteredStories, setFilteredStories] = useState<ViewedStory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [navigating, setNavigating] = useState<string | null>(null) // Track which story is being navigated to
    const { refreshSession } = useStudentSessionRefresh()
    const router = useRouter()

    useEffect(() => {
        const loadViewedStories = async () => {
            try {
                // Refresh session before loading stories
                await refreshSession()

                setLoading(true)
                setError('')

                const result = await getStudentViewedStories()

                if (result.success && result.data) {
                    setStories(result.data)
                    setFilteredStories(result.data)
                } else {
                    setError(result.error || 'Failed to load viewed stories')
                }
            } catch (err) {
                console.error('Error loading viewed stories:', err)
                setError('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        loadViewedStories()
    }, [refreshSession])

    // Filter stories based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStories(stories)
        } else {
            const filtered = stories.filter(story =>
                story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            setFilteredStories(filtered)
        }
    }, [searchTerm, stories])

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    const handleStoryClick = async (storyCode: string) => {
        try {
            // Set loading state for this specific story
            setNavigating(storyCode)
            
            // Update the authorized code in the student session
            const result = await updateStudentAuthorizedCode(storyCode)
            
            if (result.success) {
                // Navigate to the story page
                router.push(`/student/story/${storyCode}`)
            } else {
                console.error('Failed to update authorized code:', result.error)
                // Still navigate even if update fails (fallback)
                router.push(`/student/story/${storyCode}`)
            }
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

    if (filteredStories.length === 0 && searchTerm) {
        return (
            <div className="space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">Your Personal Library</h2>
                    <p className="text-gray-600">Stories you&apos;ve explored and enjoyed</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-md mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No stories found</h3>
                    <p className="text-gray-500">Try searching with different keywords or clear the search to see all stories.</p>
                </div>
            </div>
        )
    }

    if (stories.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Stories Yet</h3>
                <p className="text-gray-500">You haven&apos;t viewed any stories yet. Start exploring to build your library!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">Your Personal Library</h2>
                <p className="text-gray-600">Stories you&apos;ve explored and enjoyed</p>
            </div>

            {/* Search Bar */}
            {stories.length > 0 && (
                <div className="max-w-md mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className=" text-black block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStories.map((story) => (
                    <div
                        key={story.id}
                        className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100 ${
                            navigating === story.code ? 'opacity-75 pointer-events-none' : ''
                        }`}
                        onClick={() => {
                            // Update authorized code and navigate to the story
                            handleStoryClick(story.code)
                        }}
                    >
                        {/* Loading overlay when navigating */}
                        {navigating === story.code && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                                    <span className="text-[#1E3A8A] font-medium">Opening story...</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Book Cover/Thumbnail */}
                        <StoryThumbnail story={story} />

                        {/* Book Details */}
                        <div className="p-4 bg-white">
                            <h3 className="font-bold text-[#1E3A8A] text-base mb-1 line-clamp-2" title={story.title}>
                                {story.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 font-medium" title={story.author}>
                                by {story.author}
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
                                <div className="flex items-center text-xs text-blue-600">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Viewed
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8 text-gray-500 text-sm">
                {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                {searchTerm ? ` found for "${searchTerm}"` : ' in your library'}
            </div>
        </div>
    )
}
