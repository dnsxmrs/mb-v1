'use client'

export interface WordSearchProgress {
    foundWords: string[]
    isFinished: boolean
}

export interface MarkWordFoundResult extends WordSearchProgress {
    newWordFound: boolean
}

/**
 * Client-side cookie utilities for word search progress
 * This avoids server actions and prevents page refreshes
 */

// Helper function to set a cookie on the client side
function setCookie(name: string, value: string, days: number = 30) {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    
    const cookieOptions = [
        `expires=${expires.toUTCString()}`,
        'path=/',
        'SameSite=Strict'
    ]
    
    if (location.protocol === 'https:') {
        cookieOptions.push('Secure')
    }
    
    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions.join('; ')}`
}

// Helper function to get a cookie value on the client side
function getCookie(name: string): string | null {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length))
        }
    }
    return null
}

// Helper function to delete a cookie on the client side
function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
}

/**
 * Get user progress for a specific word search game (client-side)
 * @param id - Word search ID
 * @returns Object containing found words and completion status
 */
export function getWordSearchProgress(id: number): WordSearchProgress {
    try {
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Get progress cookie
        const progressCookie = getCookie(progressKey)
        const finishedCookie = getCookie(finishedKey)

        let foundWords: string[] = []
        let isFinished = false

        if (progressCookie) {
            try {
                foundWords = JSON.parse(progressCookie)
            } catch (error) {
                console.error('Error parsing progress cookie:', error)
                foundWords = []
            }
        }

        if (finishedCookie) {
            isFinished = finishedCookie === 'true'
        }

        return {
            foundWords,
            isFinished
        }
    } catch (error) {
        console.error('Error getting word search progress:', error)
        return {
            foundWords: [],
            isFinished: false
        }
    }
}

/**
 * Mark a word as found for a specific word search game (client-side)
 * @param id - Word search ID
 * @param word - The word that was found
 * @param allWords - All words in the game (for validation)
 * @returns Success status and updated progress
 */
export function markWordFound(id: number, word: string, allWords: string[]): MarkWordFoundResult {
    try {
        // Validate that the word exists in this word search (case-insensitive)
        const normalizedAllWords = allWords.map(w => w.toLowerCase())
        const normalizedWord = word.toLowerCase()

        if (!normalizedAllWords.includes(normalizedWord)) {
            throw new Error('Word not found in this word search')
        }

        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Get current progress
        let foundWords: string[] = []
        const progressCookie = getCookie(progressKey)

        if (progressCookie) {
            try {
                foundWords = JSON.parse(progressCookie)
            } catch (error) {
                console.error('Error parsing progress cookie:', error)
                foundWords = []
            }
        }

        // Check if word was already found (case-insensitive check)
        const normalizedFoundWords = foundWords.map(w => w.toLowerCase())
        const newWordFound = !normalizedFoundWords.includes(normalizedWord)

        // Add word if not already found
        if (newWordFound) {
            foundWords.push(word) // Keep original case for display
        }

        // Check if all words are found
        const isFinished = normalizedAllWords.every(w =>
            foundWords.some(fw => fw.toLowerCase() === w.toLowerCase())
        )

        // Update progress cookie
        setCookie(progressKey, JSON.stringify(foundWords), 30)

        // Update finished status cookie
        setCookie(finishedKey, isFinished.toString(), 30)

        return {
            foundWords,
            isFinished,
            newWordFound
        }

    } catch (error) {
        console.error('Error marking word as found:', error)
        throw error
    }
}

/**
 * Mark word search game as completed (client-side)
 * @param id - Word search ID
 * @param foundWords - Array of found words
 * @returns Success status with completion data
 */
export function markWordSearchCompleted(id: number, foundWords: string[]): WordSearchProgress {
    try {
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Save completion status
        setCookie(progressKey, JSON.stringify(foundWords), 30)
        setCookie(finishedKey, 'true', 30)

        return {
            foundWords,
            isFinished: true
        }
    } catch (error) {
        console.error('Error marking word search as completed:', error)
        throw error
    }
}

/**
 * Reset progress for a specific word search game (client-side)
 * @param id - Word search ID
 * @returns Success status
 */
export function resetWordSearchProgress(id: number): void {
    try {
        const progressKey = `wordSearchProgress:${id}`
        const finishedKey = `wordSearchFinished:${id}`

        // Delete the cookies
        deleteCookie(progressKey)
        deleteCookie(finishedKey)

    } catch (error) {
        console.error('Error resetting word search progress:', error)
        throw error
    }
}
