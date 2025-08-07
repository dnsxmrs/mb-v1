'use client'

import { useState, useEffect } from 'react'
import { Search, Play, 
    // Users, Calendar, 
    ArrowLeft } from 'lucide-react'
import { getWordSearches } from '@/actions/word-search'
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
    }, [])

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
            </div>

            {/* Word Search Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wordSearches.map((wordSearch) => (
                    <Link
                        key={wordSearch.id}
                        href={`/mga-laro/hanap-salita/${wordSearch.id}`}
                        className="group"
                    >
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-6 h-full flex flex-col">
                            {/* Title */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors"
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
                                <p className="text-gray-600 text-sm mb-4 flex-grow"
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

                            {/* Stats */}
                            {/* <div className="space-y-3 mb-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">{wordSearch.items.length} words to find</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">Added {new Date(wordSearch.createdAt).toLocaleDateString('fil-PH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div> */}

                            {/* Difficulty Badge */}
                            <div className="flex justify-between items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${wordSearch.items.length <= 5
                                    ? 'bg-green-100 text-green-800'
                                    : wordSearch.items.length <= 10
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {wordSearch.items.length <= 5
                                        ? 'Madali'
                                        : wordSearch.items.length <= 10
                                            ? 'Katamtaman'
                                            : 'Mahirap'
                                    }
                                </span>

                                {/* Play Button */}
                                <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium flex-shrink-0">
                                    <Play className="w-4 h-4 mr-1" />
                                    <span>Maglaro</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer Info */}
            <div className="text-center text-sm text-gray-500 mt-12">
                <p>Mag-click sa kahit anong hanap salita para magsimula na!</p>
            </div>
        </div>
    )
}
