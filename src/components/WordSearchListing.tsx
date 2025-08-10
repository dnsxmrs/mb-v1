'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Search, Play, ArrowLeft, CircleCheckBig
} from 'lucide-react'
import { getWordSearches, getWordSearchProgress } from '@/actions/word-search'
import Link from 'next/link'

interface WordSearchData {
    id: number
    title: string
    description: string | null
    status: string
    createdAt: Date | string
    updatedAt: Date | string
    deletedAt: Date | string | null
    items: {
        id: number
        word: string
        description: string | null
        wordSearchId: number
        createdAt: Date | string
        updatedAt: Date | string
        deletedAt: Date | string | null
    }[]
}

export default function WordSearchListing() {
    const [wordSearches, setWordSearches] = useState<WordSearchData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [completedWordSearches, setCompletedWordSearches] = useState<Set<number>>(new Set())
    const [isCheckingCompletion, setIsCheckingCompletion] = useState(false)

    // Function to check completion status for all word searches
    const checkCompletionStatus = useCallback(async (wordSearchIds: number[]) => {
        setIsCheckingCompletion(true)
        const completed = new Set<number>()

        // Check completion status for each word search
        await Promise.all(wordSearchIds.map(async (id) => {
            try {
                const progressResult = await getWordSearchProgress(id)
                if (progressResult.success && progressResult.data.isFinished) {
                    completed.add(id)
                }
            } catch (error) {
                console.error(`Error checking completion for word search ${id}:`, error)
            }
        }))

        setCompletedWordSearches(completed)
        setIsCheckingCompletion(false)
    }, [])

    useEffect(() => {
        const fetchWordSearches = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const result = await getWordSearches()
                if (result.success && result.data) {
                    // Filter only active word searches
                    const activeWordSearches = result.data.filter(ws => ws.status === 'active')
                    setWordSearches(activeWordSearches)

                    // Check completion status for all word searches
                    const wordSearchIds = activeWordSearches.map(ws => ws.id)
                    await checkCompletionStatus(wordSearchIds)
                } else {
                    setError(result.error || 'Hindi ma-load ang mga hanap salita')
                }
            } catch (err) {
                console.error('Error fetching word searches:', err)
                setError('May nangyaring hindi inaasahang pagkakamali')
            } finally {
                setIsLoading(false)
            }
        }

        fetchWordSearches()
    }, [checkCompletionStatus])

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                                <div className="h-10 bg-gray-300 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">May Error sa Paglo-load ng mga Laro</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Subukan Ulit
                </button>
            </div>
        )
    }

    // Empty state
    if (wordSearches.length === 0) {
        return (
            <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Walang Makitang Hanap Salita na Laro</h3>
                <p className="mt-1 text-sm text-gray-500">Bumalik sa ibang araw para sa mga bagong hanap salita na palaisipan!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center px-4">
                {/* Back Button */}
                <div className="flex justify-start mb-6">
                    <Link
                        href="/mga-laro"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span>Bumalik sa mga Laro</span>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mga Laro ng Hanap-Salita</h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Subukan ang inyong sarili sa aming koleksyon ng educational word search puzzles.
                    Hanapin ang mga nakatagong salita at palawakin ang inyong bokabularyo!
                </p>
                {isCheckingCompletion && (
                    <p className="text-sm text-blue-600 mt-2">
                        Checking progress status...
                    </p>
                )}
            </div>

            {/* Word Search Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wordSearches.map((wordSearch) => {
                    const isCompleted = completedWordSearches.has(wordSearch.id)

                    return (
                        <Link
                            key={wordSearch.id}
                            href={`/mga-laro/hanap-salita/${wordSearch.id}`}
                            className="group"
                        >
                            <div className={`bg-white rounded-xl shadow-md border transition-all duration-300 p-6 h-full flex flex-col relative ${isCompleted
                                    ? 'border-green-300 hover:shadow-lg hover:border-green-400 bg-green-50'
                                    : 'border-gray-200 hover:shadow-lg hover:border-blue-300'
                                }`}>
                                {/* Completion Check Mark */}
                                {isCompleted && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <CircleCheckBig className="w-6 h-6 text-green-600" />
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className={`text-xl font-semibold mb-3 transition-colors pr-8 ${isCompleted
                                        ? 'text-green-900 group-hover:text-green-700'
                                        : 'text-gray-900 group-hover:text-blue-600'
                                    }`}
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical' as const,
                                        overflow: 'hidden'
                                    }}
                                    title={wordSearch.title}>
                                    {wordSearch.title}
                                </h3>

                                {/* Description */}
                                {wordSearch.description && (
                                    <p className={`text-sm mb-4 flex-grow ${isCompleted ? 'text-green-700' : 'text-gray-600'
                                        }`}
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical' as const,
                                            overflow: 'hidden'
                                        }}
                                        title={wordSearch.description}>
                                        {wordSearch.description}
                                    </p>
                                )}

                                {/* Difficulty Badge and Play Button */}
                                <div className="flex justify-between items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${isCompleted
                                            ? 'bg-green-200 text-green-800'
                                            : wordSearch.items.length <= 5
                                                ? 'bg-green-100 text-green-800'
                                                : wordSearch.items.length <= 10
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                        {isCompleted
                                            ? 'Tapos na'
                                            : wordSearch.items.length <= 5
                                                ? 'Madali'
                                                : wordSearch.items.length <= 10
                                                    ? 'Katamtaman'
                                                    : 'Mahirap'
                                        }
                                    </span>

                                    {/* Play Button */}
                                    <div className={`flex items-center font-medium flex-shrink-0 ${isCompleted
                                            ? 'text-green-600 group-hover:text-green-700'
                                            : 'text-blue-600 group-hover:text-blue-700'
                                        }`}>
                                        <Play className="w-4 h-4 mr-1" />
                                        <span>{isCompleted ? 'Ulitin' : 'Maglaro'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Footer Info */}
            {/* <div className="text-center text-sm text-gray-500 mt-12 space-y-2">
                <p>Mag-click sa kahit anong hanap salita para magsimula na!</p>
                {completedWordSearches.size > 0 && (
                    <p className="text-green-600 font-medium">
                        ✓ Natapos mo na ang {completedWordSearches.size} sa {wordSearches.length} na hanap-salita!
                    </p>
                )}
            </div> */}
        </div>
    )
}
