'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Clock, Volume2, Loader2 } from 'lucide-react'
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

interface WordSearchGameProps {
    wordSearch: WordSearchData
}

interface PlacedWord {
    word: string
    originalWord: string
    positions: { row: number; col: number }[]
    found: boolean
}

// Improved word search grid generator with word intersections
function generateWordSearchGrid(words: string[], size: number = 15): { grid: string[][], placedWords: PlacedWord[] } {
    console.log(`Generating grid with size ${size} for ${words.length} words:`, words)

    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
    const placedWords: PlacedWord[] = []

    // Sort words by length (longest first) for better placement strategy
    const sortedWords = [...words].sort((a, b) => {
        const aClean = a.toUpperCase().replace(/[^A-Z]/g, '')
        const bClean = b.toUpperCase().replace(/[^A-Z]/g, '')
        return bClean.length - aClean.length
    })

    // Directions: horizontal, vertical, diagonal (all 8 directions)
    const directions = [
        [0, 1],   // horizontal right
        [1, 0],   // vertical down
        [1, 1],   // diagonal down-right
        [-1, 1],  // diagonal up-right
    ]

    // Helper function to check if a word can be placed with intersections
    const canPlaceWordWithIntersections = (word: string, startRow: number, startCol: number, dx: number, dy: number): boolean => {
        for (let i = 0; i < word.length; i++) {
            const row = startRow + (dx * i)
            const col = startCol + (dy * i)

            // Check bounds
            if (row < 0 || row >= size || col < 0 || col >= size) {
                return false
            }

            const currentCell = grid[row][col]
            const wordLetter = word[i]

            // Cell must be either empty OR contain the same letter (intersection)
            if (currentCell !== '' && currentCell !== wordLetter) {
                return false
            }
        }
        return true
    }

    // Helper function to calculate intersection score (higher is better)
    const calculateIntersectionScore = (word: string, startRow: number, startCol: number, dx: number, dy: number): number => {
        let score = 0
        let intersections = 0

        for (let i = 0; i < word.length; i++) {
            const row = startRow + (dx * i)
            const col = startCol + (dy * i)
            const currentCell = grid[row][col]
            const wordLetter = word[i]

            if (currentCell === wordLetter) {
                intersections++
                score += 10 // Bonus for intersections
            } else if (currentCell === '') {
                score += 1 // Small bonus for empty cells
            }
        }

        // Bonus for multiple intersections
        if (intersections > 1) {
            score += intersections * 5
        }

        return score
    }

    sortedWords.forEach((word, wordIndex) => {
        const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, '')
        if (cleanWord.length < 2) return

        console.log(`Attempting to place word ${wordIndex + 1}/${words.length}: "${word}" (${cleanWord}) - length: ${cleanWord.length}`)

        let placed = false
        let attempts = 0
        const maxAttempts = 1000 // Increased attempts for better placement
        let bestPlacement: { startRow: number, startCol: number, dx: number, dy: number, score: number } | null = null

        while (!placed && attempts < maxAttempts) {
            const direction = directions[Math.floor(Math.random() * directions.length)]
            const [dx, dy] = direction

            // Calculate valid starting positions based on direction
            let minStartRow, maxStartRow, minStartCol, maxStartCol

            if (dx > 0) {
                minStartRow = 0
                maxStartRow = size - cleanWord.length
            } else if (dx < 0) {
                minStartRow = cleanWord.length - 1
                maxStartRow = size - 1
            } else {
                minStartRow = 0
                maxStartRow = size - 1
            }

            if (dy > 0) {
                minStartCol = 0
                maxStartCol = size - cleanWord.length
            } else if (dy < 0) {
                minStartCol = cleanWord.length - 1
                maxStartCol = size - 1
            } else {
                minStartCol = 0
                maxStartCol = size - 1
            }

            // Ensure valid ranges
            if (maxStartRow < minStartRow || maxStartCol < minStartCol) {
                attempts++
                continue
            }

            const startRow = minStartRow + Math.floor(Math.random() * (maxStartRow - minStartRow + 1))
            const startCol = minStartCol + Math.floor(Math.random() * (maxStartCol - minStartCol + 1))

            // Check if word can be placed with intersections
            if (canPlaceWordWithIntersections(cleanWord, startRow, startCol, dx, dy)) {
                const score = calculateIntersectionScore(cleanWord, startRow, startCol, dx, dy)

                // Keep track of the best placement found so far
                if (!bestPlacement || score > bestPlacement.score) {
                    bestPlacement = { startRow, startCol, dx, dy, score }
                }

                // If we find a really good placement (with intersections), use it immediately
                if (score >= 15) { // Threshold for "good enough" placement
                    break
                }
            }

            attempts++
        }

        // Use the best placement found
        if (bestPlacement) {
            const { startRow, startCol, dx, dy, score } = bestPlacement

            // Place the word
            const positions = []
            let intersectionCount = 0

            for (let i = 0; i < cleanWord.length; i++) {
                const row = startRow + (dx * i)
                const col = startCol + (dy * i)

                if (grid[row][col] === cleanWord[i]) {
                    intersectionCount++
                }

                grid[row][col] = cleanWord[i]
                positions.push({ row, col })
            }

            placedWords.push({
                word: cleanWord,
                originalWord: word,
                positions,
                found: false
            })
            placed = true

            console.log(`✓ Successfully placed "${word}" at (${startRow}, ${startCol}) direction [${dx}, ${dy}] after ${attempts + 1} attempts (score: ${score}, intersections: ${intersectionCount})`)
        }

        if (!placed) {
            console.warn(`✗ Failed to place word "${word}" after ${maxAttempts} attempts`)
        }
    })

    console.log(`Grid generation complete. Successfully placed ${placedWords.length}/${words.length} words`)

    // Fill empty cells with random letters
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
            }
        }
    }

    return { grid, placedWords }
}

export default function WordSearchGame({ wordSearch }: WordSearchGameProps) {
    const [gameGrid, setGameGrid] = useState<string[][]>([])
    const [placedWords, setPlacedWords] = useState<PlacedWord[]>([])
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState<{ row: number, col: number } | null>(null)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [endTime, setEndTime] = useState<Date | null>(null)
    const [gameCompleted, setGameCompleted] = useState(false)
    const [modalDismissed, setModalDismissed] = useState(false) // Track if user dismissed the modal
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [foundWordMessage, setFoundWordMessage] = useState<{ word: string, description: string | null } | null>(null)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Load voices function with proper async handling
    const loadVoices = () => {
        if ('speechSynthesis' in window) {
            const availableVoices = speechSynthesis.getVoices()
            console.log('Available voices:', availableVoices.length, availableVoices)
            setVoices(availableVoices)
            return availableVoices
        }
        return []
    }

    // Text-to-speech function with better voice selection
    const speakWord = (word: string) => {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech immediately
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel()
                console.log('Stopped previous speech')
            }

            setIsSpeaking(true)

            const utterance = new SpeechSynthesisUtterance(word)

            // Set up event handlers
            utterance.onstart = () => {
                console.log('Speech started')
            }

            utterance.onend = () => {
                console.log('Speech ended')
                setIsSpeaking(false)
            }

            utterance.onerror = () => {
                // console.error('Speech error:', event.error)
                setIsSpeaking(false)
            }

            // Function to speak with available voices
            const speakWithVoices = (availableVoices: SpeechSynthesisVoice[]) => {
                console.log('Speaking with available voices:', availableVoices.length)

                // Preferred voice options for English/Tagalog (in order of preference)
                const preferredVoices = [
                    'Microsoft Angelo Online (Natural) - Filipino (Philippines)',
                    'Microsoft Blessica Online (Natural) - Filipino (Philippines)',
                    'Microsoft James Online (Natural) - English (Philippines)',
                    'Microsoft Rosa Online (Natural) - English (Philippines)',
                    'Microsoft James',
                    'Microsoft Rosa',
                    'Microsoft Angelo',
                    'Microsoft Blessica',
                    'Filipino',
                    'Philippines',
                ]

                // Find the best available voice
                let selectedVoice = null

                // First try to find by name
                for (const preferredVoice of preferredVoices) {
                    selectedVoice = availableVoices.find(voice =>
                        voice.name.toLowerCase().includes(preferredVoice.toLowerCase())
                    )
                    if (selectedVoice) {
                        console.log('Selected voice by name:', selectedVoice.name)
                        break
                    }
                }

                // If no preferred voice found, try by language
                if (!selectedVoice) {
                    selectedVoice = availableVoices.find(voice =>
                        voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en')
                    )
                    if (selectedVoice) {
                        console.log('Selected voice by language:', selectedVoice.name, selectedVoice.lang)
                    }
                }

                // Use first available voice as fallback
                if (!selectedVoice && availableVoices.length > 0) {
                    selectedVoice = availableVoices[0]
                    console.log('Using fallback voice:', selectedVoice.name)
                }

                // Apply voice settings
                if (selectedVoice) {
                    utterance.voice = selectedVoice
                }

                utterance.rate = 0.8
                utterance.pitch = 1.0
                utterance.volume = 0.8

                console.log('Speaking with voice:', selectedVoice?.name || 'default', 'Text:', word)
                speechSynthesis.speak(utterance)
            }

            // Use loaded voices or get them if not loaded
            let availableVoices = voices.length > 0 ? voices : speechSynthesis.getVoices()

            // If no voices are available, try to load them and retry
            if (availableVoices.length === 0) {
                console.log('No voices available, attempting to reload...')

                // Try to trigger voice loading
                speechSynthesis.getVoices()

                // Wait a bit and try again
                setTimeout(() => {
                    availableVoices = speechSynthesis.getVoices()
                    console.log('Retry - Available voices:', availableVoices.length)

                    if (availableVoices.length > 0) {
                        setVoices(availableVoices)
                        speakWithVoices(availableVoices)
                    } else {
                        // Fallback: speak without voice selection
                        console.log('No voices found, using default')
                        speechSynthesis.speak(utterance)
                    }
                }, 100)
            } else {
                speakWithVoices(availableVoices)
            }
        }
    }

    // Initialize game
    useEffect(() => {
        const words = wordSearch.items.map(item => item.word)

        // Calculate appropriate grid size
        const longestWordLength = Math.max(...words.map(word => word.length))
        const wordCount = words.length

        // Calculate grid size with enough space for all words
        // Formula: max(longest_word + 3, sqrt(total_chars) + 4, 15)
        const totalChars = words.reduce((sum, word) => sum + word.length, 0)
        const minSizeForChars = Math.ceil(Math.sqrt(totalChars)) + 4
        const minSizeForLongest = longestWordLength + 3
        const gridSize = Math.max(minSizeForLongest, minSizeForChars, 15)

        console.log(`Grid size calculation:`)
        console.log(`- Words: ${wordCount}`)
        console.log(`- Longest word: ${longestWordLength} chars`)
        console.log(`- Total characters: ${totalChars}`)
        console.log(`- Min size for chars: ${minSizeForChars}`)
        console.log(`- Min size for longest: ${minSizeForLongest}`)
        console.log(`- Final grid size: ${gridSize}x${gridSize}`)

        const { grid, placedWords: placed } = generateWordSearchGrid(words, gridSize)
        setGameGrid(grid)
        setPlacedWords(placed)
        setStartTime(new Date())
    }, [wordSearch])

    // Load speech synthesis voices
    useEffect(() => {
        if ('speechSynthesis' in window) {
            // Load voices immediately if they're already available
            loadVoices()

            // Set up event listener for when voices change (load asynchronously)
            const handleVoicesChanged = () => {
                console.log('Voices changed event fired')
                loadVoices()
            }

            speechSynthesis.onvoiceschanged = handleVoicesChanged

            // Some browsers might need a small delay
            const timeoutId = setTimeout(() => {
                loadVoices()
            }, 100)

            // Cleanup
            return () => {
                speechSynthesis.onvoiceschanged = null
                clearTimeout(timeoutId)
            }
        }
    }, [])

    // Update timer every second
    useEffect(() => {
        if (!gameCompleted) {
            const timer = setInterval(() => {
                setCurrentTime(new Date())
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [gameCompleted])

    // Check if game is completed
    useEffect(() => {
        if (placedWords.length > 0 && foundWords.size === placedWords.length && !gameCompleted && !modalDismissed) {
            setEndTime(new Date())
            setGameCompleted(true)
            console.log('Game completed! Setting modal to show.')
        }
    }, [foundWords, placedWords, gameCompleted, modalDismissed])

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && gameCompleted) {
                setGameCompleted(false)
            }
        }

        document.addEventListener('keydown', handleEscapeKey)
        return () => {
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [gameCompleted])

    const resetGame = () => {
        const words = wordSearch.items.map(item => item.word)

        // Calculate appropriate grid size (same logic as initialization)
        const longestWordLength = Math.max(...words.map(word => word.length))
        const wordCount = words.length

        // Calculate grid size with enough space for all words
        const totalChars = words.reduce((sum, word) => sum + word.length, 0)
        const minSizeForChars = Math.ceil(Math.sqrt(totalChars)) + 4
        const minSizeForLongest = longestWordLength + 3
        const gridSize = Math.max(minSizeForLongest, minSizeForChars, 15)

        console.log(`Reset: Grid size ${gridSize}x${gridSize} for ${wordCount} words`)

        const { grid, placedWords: placed } = generateWordSearchGrid(words, gridSize)
        setGameGrid(grid)
        setPlacedWords(placed)
        setFoundWords(new Set())
        setSelectedCells(new Set())
        setFoundWordMessage(null)
        setStartTime(new Date())
        setCurrentTime(new Date())
        setEndTime(null)
        setGameCompleted(false)
        setModalDismissed(false) // Reset modal dismissal when starting new game
    }

    const closeModal = () => {
        console.log('Closing modal - current gameCompleted:', gameCompleted)
        setGameCompleted(false)
        setModalDismissed(true) // Mark that user dismissed the modal
        console.log('Modal should be closed now')
    }

    const handleCellMouseDown = (row: number, col: number) => {
        setIsSelecting(true)
        setSelectionStart({ row, col })
        setSelectedCells(new Set([`${row}-${col}`]))
    }

    const handleCellMouseEnter = (row: number, col: number) => {
        if (!isSelecting || !selectionStart) return

        // Calculate selection path
        const cells = new Set<string>()
        const { row: startRow, col: startCol } = selectionStart

        // Determine direction
        const deltaRow = row - startRow
        const deltaCol = col - startCol

        // Only allow straight lines (horizontal, vertical, diagonal)
        if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
            const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
            const stepRow = steps === 0 ? 0 : deltaRow / steps
            const stepCol = steps === 0 ? 0 : deltaCol / steps

            for (let i = 0; i <= steps; i++) {
                const currentRow = startRow + Math.round(stepRow * i)
                const currentCol = startCol + Math.round(stepCol * i)
                cells.add(`${currentRow}-${currentCol}`)
            }
        }

        setSelectedCells(cells)
    }

    const handleCellMouseUp = () => {
        if (!isSelecting) return

        // Check if selection matches any word
        const selectedPositions = Array.from(selectedCells).map(cell => {
            const [row, col] = cell.split('-').map(Number)
            return { row, col }
        })

        const selectedWord = selectedPositions
            .map(pos => gameGrid[pos.row]?.[pos.col])
            .join('')

        // Check both forward and backward
        const reversedWord = selectedWord.split('').reverse().join('')

        const matchedWord = placedWords.find(word =>
            (word.word === selectedWord || word.word === reversedWord) &&
            !foundWords.has(word.word)
        )

        if (matchedWord) {
            setFoundWords(prev => new Set([...prev, matchedWord.word]))

            // Find the word item for description
            const wordItem = wordSearch.items.find(item =>
                item.word.toUpperCase().replace(/[^A-Z]/g, '') === matchedWord.word
            )

            // Show found word message with description
            setFoundWordMessage({
                word: matchedWord.originalWord,
                description: wordItem?.description || null
            })

            // Speak the word
            speakWord(matchedWord.originalWord + ', ' + (wordItem?.description || ''))

            // Auto-clear the message after 8 seconds (longer for reading)
            // setTimeout(() => {
            //     setFoundWordMessage(null)
            // }, 8000)
        }

        setIsSelecting(false)
        setSelectionStart(null)
        setSelectedCells(new Set())
    }

    const getElapsedTime = () => {
        if (!startTime) return '00:00'
        const endTimeToUse = endTime || currentTime
        const elapsed = Math.floor((endTimeToUse.getTime() - startTime.getTime()) / 1000)
        const minutes = Math.floor(elapsed / 60)
        const seconds = elapsed % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const getCellClass = (row: number, col: number) => {
        const cellKey = `${row}-${col}`
        let classes = 'w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm font-bold border border-gray-300 cursor-pointer select-none relative touch-none '

        if (selectedCells.has(cellKey)) {
            classes += 'bg-blue-200 '
        } else {
            classes += 'bg-white hover:bg-gray-100 '
        }

        // Check if cell is part of a found word
        const isPartOfFoundWord = placedWords.some(word =>
            foundWords.has(word.word) &&
            word.positions.some((pos) => pos.row === row && pos.col === col)
        )

        if (isPartOfFoundWord) {
            classes += 'bg-green-500 text-green-800 '
        }

        return classes
    }

    const getWordStrikethrough = (word: PlacedWord) => {
        if (!foundWords.has(word.word) || word.positions.length === 0) return null

        const firstPos = word.positions[0]
        const lastPos = word.positions[word.positions.length - 1]

        // Calculate the line position and angle - responsive cell sizes
        let cellSize = 16 // default (w-4 h-4)
        if (window.innerWidth >= 768) { // md breakpoint
            cellSize = 32
        } else if (window.innerWidth >= 640) { // sm breakpoint
            cellSize = 24
        } else if (window.innerWidth >= 475) { // xs breakpoint (custom)
            cellSize = 20
        }

        const cellOffset = cellSize / 2

        const startX = firstPos.col * cellSize + cellOffset
        const startY = firstPos.row * cellSize + cellOffset
        const endX = lastPos.col * cellSize + cellOffset
        const endY = lastPos.row * cellSize + cellOffset

        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)

        // Responsive line thickness
        let lineHeight = '2px'
        if (window.innerWidth >= 768) {
            lineHeight = '5px'
        } else if (window.innerWidth >= 640) {
            lineHeight = '4px'
        } else if (window.innerWidth >= 475) {
            lineHeight = '3px'
        }

        return (
            <div
                key={`strike-${word.word}`}
                className="absolute bg-green-600/50 pointer-events-none z-10"
                style={{
                    left: startX,
                    top: startY,
                    width: length,
                    height: lineHeight,
                    transformOrigin: '0 50%',
                    transform: `rotate(${angle}deg)`,
                }}
            />
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-auto">
                        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2">
                            <Link
                                href="/games/word-search"
                                className="text-gray-900 flex items-center gap-1 sm:gap-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-sm sm:text-base">Back</span>
                            </Link>
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-black">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{getElapsedTime()}</span>
                                </div>
                                {/* Debug button for testing speech synthesis */}
                                {/* <button
                            onClick={() => {
                                console.log('Testing speech synthesis...')
                                console.log('Available voices:', voices.length, voices.map(v => v.name))
                                speakWord('Test speech synthesis')
                            }}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
                        >
                            🔊 <span className="hidden sm:inline">Test TTS</span>
                        </button> */}
                                <button
                                    onClick={resetGame}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                                >
                                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Reset</span>
                                </button>
                            </div>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-justify">{wordSearch.title}</h1>
                        {wordSearch.description && (
                            <p className="text-sm sm:text-base text-gray-600 text-justify">{wordSearch.description}</p>
                        )}
                    </div>


                </div>

                {/* Game Completed Modal */}
                {gameCompleted && !modalDismissed && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => {
                            console.log('Background clicked')
                            closeModal()
                        }}
                    >
                        <div
                            className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center relative"
                            onClick={(e) => {
                                console.log('Modal content clicked - preventing close')
                                e.stopPropagation()
                            }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={(e) => {
                                    console.log('Close button clicked')
                                    e.preventDefault()
                                    e.stopPropagation()
                                    closeModal()
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                aria-label="Close modal"
                                type="button"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                            <p className="text-gray-600 mb-4">
                                You completed the word search in {getElapsedTime()}!
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={resetGame}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Play Again
                                </button>
                                <Link
                                    href="/games/word-search"
                                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                                >
                                    More Games
                                </Link>
                                <button
                                    onClick={(e) => {
                                        console.log('Close button in footer clicked')
                                        e.preventDefault()
                                        e.stopPropagation()
                                        closeModal()
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                    {/* First Row: Words to Find and Found Word */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
                        {/* Words to Find */}
                        <div className="">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                                Words to Find ({foundWords.size}/{placedWords.length})
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                                {placedWords.map((word, index) => {
                                    const isFound = foundWords.has(word.word)

                                    return (
                                        <div
                                            key={index}
                                            className={`px-2 py-1 rounded text-xs sm:text-sm ${isFound
                                                ? 'bg-green-50 border border-green-200 text-green-800'
                                                : 'text-black hover:bg-gray-50 border border-gray-200'
                                                }`}
                                        >
                                            <div className={`font-medium ${isFound ? 'line-through' : ''}`}>
                                                {word.originalWord}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Found Word */}
                        <div className="">
                            {/* <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Found Word</h4> */}
                            {foundWordMessage ? (
                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <div className="flex flex-col gap-2">
                                        <div className='flex items-center justify-between gap-2 sm:gap-3'>
                                            <div className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                                                {foundWordMessage.word}
                                            </div>
                                            <button
                                                onClick={() => speakWord(foundWordMessage.word + ". " + (foundWordMessage.description || ''))}
                                                disabled={isSpeaking}
                                                className={`px-2 sm:px-3 py-1 text-white rounded transition-colors text-xs sm:text-sm flex-shrink-0 ${isSpeaking
                                                    ? 'bg-blue-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                    }`}
                                            >
                                                {isSpeaking ? (
                                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                ) : (
                                                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                )}
                                            </button>
                                        </div>
                                        {foundWordMessage.description && (
                                            <div className="text-gray-600 text-xs sm:text-sm break-words">
                                                {foundWordMessage.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-xs sm:text-sm">
                                    Find a word to see its description here
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Second Row: Word Search Grid */}
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-5">
                        <div className="flex justify-center">
                            <div className="overflow-x-auto touch-pan-x">
                                <div
                                    className="text-gray-500 inline-block border-2 border-gray-400 p-1 sm:p-2 bg-gray-50 relative min-w-fit select-none"
                                    style={{ touchAction: 'none' }}
                                    onMouseLeave={() => {
                                        if (isSelecting) {
                                            handleCellMouseUp()
                                        }
                                    }}
                                >
                                    {gameGrid.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex">
                                            {row.map((cell, colIndex) => (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className={getCellClass(rowIndex, colIndex)}
                                                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                                                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                                                    onMouseUp={handleCellMouseUp}
                                                    onTouchStart={(e) => {
                                                        e.preventDefault()
                                                        handleCellMouseDown(rowIndex, colIndex)
                                                    }}
                                                    onTouchMove={(e) => {
                                                        e.preventDefault()
                                                        const touch = e.touches[0]
                                                        const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
                                                        if (element && element.dataset && element.dataset.row && element.dataset.col) {
                                                            handleCellMouseEnter(parseInt(element.dataset.row), parseInt(element.dataset.col))
                                                        }
                                                    }}
                                                    onTouchEnd={(e) => {
                                                        e.preventDefault()
                                                        handleCellMouseUp()
                                                    }}
                                                    data-row={rowIndex}
                                                    data-col={colIndex}
                                                >
                                                    {cell}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    {/* Strikethrough lines for found words */}
                                    {placedWords.map((word) => getWordStrikethrough(word))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
