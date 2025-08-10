'use server'

import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification'
import { cookies } from 'next/headers'

export interface WordSearchData {
    title: string
    description?: string
    status: 'active' | 'inactive'
    words: Array<{
        word: string
        description?: string
    }>
}

export interface WordSearchProgress {
    foundWords: string[]
    isFinished: boolean
}

export interface MarkWordFoundResult extends WordSearchProgress {
    newWordFound: boolean
}

export async function createWordSearch(data: WordSearchData) {
    try {
        // Validate required fields
        if (!data.title || !data.title.trim()) {
            return {
                success: false,
                error: 'Title is required'
            }
        }

        if (!data.words || data.words.length === 0) {
            return {
                success: false,
                error: 'At least one word is required'
            }
        }

        // Validate each word
        for (const wordItem of data.words) {
            if (!wordItem.word || !wordItem.word.trim()) {
                return {
                    success: false,
                    error: 'All words must have a value'
                }
            }
        }

        // Create word search with nested word items
        const wordSearch = await prisma.wordSearch.create({
            data: {
                title: data.title.trim(),
                description: data.description?.trim() || null,
                status: data.status,
                items: {
                    create: data.words.map(wordItem => ({
                        word: wordItem.word.trim(),
                        description: wordItem.description?.trim() || null
                    }))
                }
            },
            include: {
                items: true
            }
        })

        revalidatePath('/pamamahala-ng-laro')

        await createNotification('word_search_created', `Nabuo na ang hanap salita: '${wordSearch.title}'`)

        return {
            success: true,
            data: wordSearch,
            message: 'Nabuo na ang hanap salita!'
        }

    } catch (error) {
        console.error('Error creating word search:', error)
        return {
            success: false,
            error: 'Failed to create word search. Please try again.'
        }
    }
}

export async function getWordSearches() {
    try {
        const wordSearches = await prisma.wordSearch.findMany({
            where: {
                deletedAt: null
            },
            include: {
                items: {
                    where: {
                        deletedAt: null
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: wordSearches
        }
    } catch (error) {
        console.error('Error fetching word searches:', error)
        return {
            success: false,
            error: 'Failed to fetch word searches'
        }
    }
}

export async function updateWordSearchStatus(id: number, status: 'active' | 'inactive') {
    try {
        const wordSearch = await prisma.wordSearch.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            }
        })

        revalidatePath('/pamamahala-ng-laro')

        await createNotification('word_search_status_updated', `Nabago na ang hanap salita: '${wordSearch.title}' ${status === 'active' ? 'na-activate' : 'na-deactivate'}`)

        return {
            success: true,
            data: wordSearch,
            message: `Nabago na ang hanap salita ${status === 'active' ? 'na-activate' : 'na-deactivate'}!`
        }
    } catch (error) {
        console.error('Error updating word search status:', error)
        return {
            success: false,
            error: 'Failed to update word search status'
        }
    }
}

export async function deleteWordSearch(id: number) {
    try {
        // Soft delete - update deletedAt timestamp
        const wordSearch = await prisma.wordSearch.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date()
            }
        })

        // Also soft delete all associated items
        await prisma.wordSearchItem.updateMany({
            where: { wordSearchId: id },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date()
            }
        })

        revalidatePath('/pamamahala-ng-laro')

        await createNotification('word_search_deleted', `Nabura na ang word search: '${wordSearch.title}'`)

        return {
            success: true,
            data: wordSearch,
            message: 'Nabura na ang word search!'
        }
    } catch (error) {
        console.error('Error deleting word search:', error)
        return {
            success: false,
            error: 'Failed to delete word search'
        }
    }
}

export async function updateWordSearch(id: number, data: WordSearchData) {
    try {
        // Validate required fields
        if (!data.title || !data.title.trim()) {
            return {
                success: false,
                error: 'Title is required'
            }
        }

        if (!data.words || data.words.length === 0) {
            return {
                success: false,
                error: 'At least one word is required'
            }
        }

        // Validate each word
        for (const wordItem of data.words) {
            if (!wordItem.word || !wordItem.word.trim()) {
                return {
                    success: false,
                    error: 'All words must have a value'
                }
            }
        }

        // Update word search with nested word items
        const updatedWordSearch = await prisma.wordSearch.update({
            where: { id },
            data: {
                title: data.title.trim(),
                description: data.description?.trim() || null,
                status: data.status,
                items: {
                    deleteMany: {}, // Delete all existing items
                    create: data.words.map(wordItem => ({
                        word: wordItem.word.trim(),
                        description: wordItem.description?.trim() || null
                    }))
                }
            },
            include: {
                items: true
            }
        })

        revalidatePath('/pamamahala-ng-laro')

        await createNotification('word_search_updated', `Nabago na ang hanap salita: '${updatedWordSearch.title}'`)

        return {
            success: true,
            data: updatedWordSearch,
            message: 'Nabago na ang hanap salita!'
        }

    } catch (error) {
        console.error('Error updating word search:', error)
        return {
            success: false,
            error: 'Nabigong i-update ang hanap salita. Pakisubukan muli.'
        }
    }
}

/**
 * Get a specific word search by ID
 * @param id - Word search ID
 * @returns Word search data or null if not found
 */
export async function getWordSearchById(id: number) {
    try {
        const wordSearch = await prisma.wordSearch.findFirst({
            where: {
                id,
                deletedAt: null,
                status: 'active'
            },
            include: {
                items: {
                    where: {
                        deletedAt: null
                    }
                }
            }
        })

        return {
            success: true,
            data: wordSearch
        }
    } catch (error) {
        console.error('Error fetching word search by ID:', error)
        return {
            success: false,
            error: 'Failed to fetch word search',
            data: null
        }
    }
}

// Progress tracking functions using session cookies

/**
 * Get user progress for a specific word search game
 * @param id - Word search ID
 * @returns Object containing found words and completion status
 */
export async function getWordSearchProgress(id: number) {
    try {
        const cookieStore = await cookies()
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Get progress cookie
        const progressCookie = cookieStore.get(progressKey)
        const finishedCookie = cookieStore.get(finishedKey)

        let foundWords: string[] = []
        let isFinished = false

        if (progressCookie) {
            try {
                foundWords = JSON.parse(progressCookie.value)
            } catch (error) {
                console.error('Error parsing progress cookie:', error)
                foundWords = []
            }
        }

        if (finishedCookie) {
            isFinished = finishedCookie.value === 'true'
        }

        return {
            success: true,
            data: {
                foundWords,
                isFinished
            } as WordSearchProgress
        }
    } catch (error) {
        console.error('Error getting word search progress:', error)
        return {
            success: false,
            error: 'Failed to get progress',
            data: {
                foundWords: [],
                isFinished: false
            } as WordSearchProgress
        }
    }
}

/**
 * Mark a word as found for a specific word search game
 * @param id - Word search ID
 * @param word - The word that was found
 * @returns Success status and updated progress
 */
export async function markWordFound(id: number, word: string) {
    try {
        // First, get the word search to validate the word and get all words
        const wordSearchResult = await getWordSearchById(id)
        if (!wordSearchResult.success || !wordSearchResult.data) {
            return {
                success: false,
                error: 'Word search not found or inactive'
            }
        }

        const wordSearch = wordSearchResult.data

        // Get all words in this word search (case-insensitive)
        const allWords = wordSearch.items.map(item => item.word.toLowerCase())
        const normalizedWord = word.toLowerCase()

        // Validate that the word exists in this word search
        if (!allWords.includes(normalizedWord)) {
            return {
                success: false,
                error: 'Word not found in this word search'
            }
        }

        const cookieStore = await cookies()
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Get current progress
        let foundWords: string[] = []
        const progressCookie = cookieStore.get(progressKey)

        if (progressCookie) {
            try {
                foundWords = JSON.parse(progressCookie.value)
            } catch (error) {
                console.error('Error parsing progress cookie:', error)
                foundWords = []
            }
        }

        // Add word if not already found (case-insensitive check)
        const normalizedFoundWords = foundWords.map(w => w.toLowerCase())
        if (!normalizedFoundWords.includes(normalizedWord)) {
            foundWords.push(word) // Keep original case for display
        }

        // Check if all words are found
        const isFinished = allWords.every(w =>
            foundWords.some(fw => fw.toLowerCase() === w.toLowerCase())
        )

        // Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        }

        // Update progress cookie
        cookieStore.set(progressKey, JSON.stringify(foundWords), cookieOptions)

        // Update finished status cookie
        cookieStore.set(finishedKey, isFinished.toString(), cookieOptions)

        return {
            success: true,
            data: {
                foundWords,
                isFinished,
                newWordFound: !normalizedFoundWords.includes(normalizedWord)
            } as MarkWordFoundResult,
            message: isFinished ? 'Congratulations! You found all words!' : 'Word found!'
        }

    } catch (error) {
        console.error('Error marking word as found:', error)
        return {
            success: false,
            error: 'Failed to mark word as found'
        }
    }
}

/**
 * Mark word search game as completed in session
 * @param id - Word search ID
 * @param foundWords - Array of found words
 * @returns Success status with completion data
 */
export async function markWordSearchCompleted(id: number, foundWords: string[]) {
    try {
        // Validate word search exists
        const wordSearch = await prisma.wordSearch.findUnique({
            where: { id },
            include: { items: true }
        })

        if (!wordSearch) {
            return {
                success: false,
                error: 'Word search not found'
            }
        }

        const cookieStore = await cookies()
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Cookie options for 30 days
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            maxAge: 30 * 24 * 60 * 60 // 30 days
        }

        // Save completion status
        cookieStore.set(progressKey, JSON.stringify(foundWords), cookieOptions)
        cookieStore.set(finishedKey, 'true', cookieOptions)

        return {
            success: true,
            data: {
                foundWords,
                isFinished: true
            },
            message: 'Game completed successfully!'
        }
    } catch (error) {
        console.error('Error marking word search as completed:', error)
        return {
            success: false,
            error: 'Failed to mark game as completed'
        }
    }
}

/**
 * Reset progress for a specific word search game
 * @param id - Word search ID
 * @returns Success status
 */
export async function resetWordSearchProgress(id: number) {
    try {
        const cookieStore = await cookies()
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Delete the cookies by setting them with past expiration
        cookieStore.delete(progressKey)
        cookieStore.delete(finishedKey)

        return {
            success: true,
            message: 'Progress reset successfully'
        }
    } catch (error) {
        console.error('Error resetting word search progress:', error)
        return {
            success: false,
            error: 'Failed to reset progress'
        }
    }
}