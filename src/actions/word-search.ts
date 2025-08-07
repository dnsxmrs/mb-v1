'use server'

import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification'

export interface WordSearchData {
    title: string
    description?: string
    status: 'active' | 'inactive'
    words: Array<{
        word: string
        description?: string
    }>
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

export async function updateWordSearch (id: number, data: WordSearchData) {
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