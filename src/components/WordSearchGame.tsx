'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react'
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

// Simple word search grid generator
function generateWordSearchGrid(words: string[], size: number = 15): { grid: string[][], placedWords: PlacedWord[] } {
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
    const placedWords: PlacedWord[] = []

    // Shuffle words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5)

    // Directions: horizontal, vertical, diagonal
    const directions = [
        [0, 1],  // horizontal
        [1, 0],  // vertical
        [1, 1],  // diagonal down-right
        [-1, 1], // diagonal up-right
    ]

    shuffledWords.forEach(word => {
        const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, '')
        if (cleanWord.length < 2) return

        let placed = false
        let attempts = 0

        while (!placed && attempts < 100) {
            const direction = directions[Math.floor(Math.random() * directions.length)]
            const [dx, dy] = direction

            // Find a valid starting position
            const maxStartRow = dx < 0 ? cleanWord.length - 1 : dx > 0 ? size - cleanWord.length : size - 1
            const maxStartCol = dy < 0 ? cleanWord.length - 1 : dy > 0 ? size - cleanWord.length : size - 1

            const startRow = Math.floor(Math.random() * (maxStartRow + 1))
            const startCol = Math.floor(Math.random() * (maxStartCol + 1))

            // Check if word can be placed
            let canPlace = true
            for (let i = 0; i < cleanWord.length; i++) {
                const row = startRow + (dx * i)
                const col = startCol + (dy * i)

                if (row < 0 || row >= size || col < 0 || col >= size) {
                    canPlace = false
                    break
                }

                if (grid[row][col] !== '' && grid[row][col] !== cleanWord[i]) {
                    canPlace = false
                    break
                }
            }

            if (canPlace) {
                // Place the word
                const positions = []
                for (let i = 0; i < cleanWord.length; i++) {
                    const row = startRow + (dx * i)
                    const col = startCol + (dy * i)
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
            }

            attempts++
        }
    })

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
    const [showHints] = useState(false)
    const [gameCompleted, setGameCompleted] = useState(false)
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [foundWordMessage, setFoundWordMessage] = useState<{ word: string, description: string | null } | null>(null)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

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
            const utterance = new SpeechSynthesisUtterance(word)

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
        // Find the longest word and add 5 for grid size
        const longestWordLength = Math.max(...words.map(word => word.length))
        const gridSize = longestWordLength + 5
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
        if (placedWords.length > 0 && foundWords.size === placedWords.length && !gameCompleted) {
            setEndTime(new Date())
            setGameCompleted(true)
        }
    }, [foundWords, placedWords, gameCompleted])

    const resetGame = () => {
        const words = wordSearch.items.map(item => item.word)
        // Find the longest word and add 5 for grid size
        const longestWordLength = Math.max(...words.map(word => word.length))
        const gridSize = longestWordLength + 5
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
        let classes = 'w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-300 cursor-pointer select-none relative '

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

        // Calculate the line position and angle
        const startX = firstPos.col * 32 + 16 // 32px cell width + 16px center offset
        const startY = firstPos.row * 32 + 16 // 32px cell height + 16px center offset
        const endX = lastPos.col * 32 + 16
        const endY = lastPos.row * 32 + 16

        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)

        return (
            <div
                key={`strike-${word.word}`}
                className="absolute bg-green-600/50 pointer-events-none z-10"
                style={{
                    left: startX,
                    top: startY,
                    width: length,
                    height: '5px',
                    transformOrigin: '0 50%',
                    transform: `rotate(${angle}deg)`,
                }}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href="/games/word-search"
                            className="text-gray-900 flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{wordSearch.title}</h1>
                    </div>
                    {wordSearch.description && (
                        <p className="text-gray-600 max-w-2xl">{wordSearch.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-black">
                        <Clock className="w-4 h-4" />
                        <span>{getElapsedTime()}</span>
                    </div>
                    {/* Debug button for testing speech synthesis */}
                    <button
                        onClick={() => {
                            console.log('Testing speech synthesis...')
                            console.log('Available voices:', voices.length, voices.map(v => v.name))
                            speakWord('Test speech synthesis')
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                        🔊 Test TTS
                    </button>
                    <button
                        onClick={resetGame}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Game Completed Modal */}
            {gameCompleted && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
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
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Word Search Grid */}
                <div className="lg:col-span-3">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                        <div
                            className="text-gray-500 inline-block border-2 border-gray-400 p-2 bg-gray-50 relative"
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
                                        >
                                            {cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {/* Strikethrough lines for found words */}
                            {placedWords.map((word) => getWordStrikethrough(word))}
                        </div>

                        {/* Found Word Display - Inside Grid Container */}
                        {foundWordMessage && (
                            <div className="lg:col-span-1 mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-gray-800">{foundWordMessage.word}</span>
                                        {foundWordMessage.description && (
                                            <span className="text-gray-600 ml-2">- {foundWordMessage.description}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => speakWord(foundWordMessage.word + ". " + (foundWordMessage.description || ''))}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        🔊
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Words List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Words to Find ({foundWords.size}/{placedWords.length})
                        </h3>
                        <div className="space-y-2">
                            {placedWords.map((word, index) => {
                                const isFound = foundWords.has(word.word)
                                const wordItem = wordSearch.items.find(item =>
                                    item.word.toUpperCase().replace(/[^A-Z]/g, '') === word.word
                                )

                                return (
                                    <div
                                        key={index}
                                        className={`${isFound
                                            ? 'bg-green-50 border-green-200 text-green-800'
                                            : 'text-black'
                                            }`}
                                    >
                                        <div className={`font-medium ${isFound ? 'line-through' : ''}`}>
                                            {word.originalWord}
                                        </div>
                                        {showHints && wordItem?.description && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {wordItem.description}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
