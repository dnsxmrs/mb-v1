'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import React from 'react'
import { Gift, CheckCircle, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { getMysteryBoxItems, type MysteryBoxItem } from "@/actions/mystery-box"
import MysteryBoxImage from './MysteryBoxImage'

// Cookie utility functions
const COOKIE_NAME = 'mysterybox_completed'
const COOKIE_EXPIRY_DAYS = 30

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
}

const setCookie = (name: string, value: string, days: number): void => {
    if (typeof document === 'undefined') return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCompletedItemsFromCookie = (): Set<number> => {
    const cookieValue = getCookie(COOKIE_NAME)
    if (!cookieValue) return new Set()

    try {
        const completedIds = JSON.parse(cookieValue)
        return new Set(Array.isArray(completedIds) ? completedIds : [])
    } catch {
        return new Set()
    }
}

const saveCompletedItemsToCookie = (completedItems: Set<number>): void => {
    const completedArray = Array.from(completedItems)
    setCookie(COOKIE_NAME, JSON.stringify(completedArray), COOKIE_EXPIRY_DAYS)
}

// Static motion variants to prevent object recreation
const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.3, rotateX: -45 },
    animate: { opacity: 1, y: -60, scale: 1, rotateX: 0 },
    exit: { opacity: 0, y: 30, scale: 0.8, rotateX: -20 }
}

const floatingAnimation = {
    y: [-3, 3, -3],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
}

export default function MysteryBoxGame() {
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())
    const [availableItems, setAvailableItems] = useState<MysteryBoxItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [openedBoxId, setOpenedBoxId] = useState<number | null>(null)
    const [inputValues, setInputValues] = useState<{ [key: number]: string[] }>({})
    const [showSuccess, setShowSuccess] = useState<number | null>(null)
    const [showError, setShowError] = useState<number | null>(null)

    // Load completed items from cookies on component mount
    useEffect(() => {
        const savedCompletedItems = getCompletedItemsFromCookie()
        if (savedCompletedItems.size > 0) {
            console.log('Loaded completed items from cookies:', Array.from(savedCompletedItems))
        }
        setCompletedItems(savedCompletedItems)
    }, [])

    // Save to cookies whenever completedItems changes
    useEffect(() => {
        if (completedItems.size > 0) {
            console.log('Saving completed items to cookies:', Array.from(completedItems))
            saveCompletedItemsToCookie(completedItems)
        }
    }, [completedItems])

    // Color variants for visual variety
    const getBoxColor = useCallback((itemId: number) => {
        const colors: Array<'black' | 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'yellow'> = [
            'black', 'blue', 'green', 'orange', 'red', 'violet', 'yellow'
        ];
        return colors[(itemId - 1) % colors.length];
    }, []);

    // Memoize expensive calculations
    const itemCalculations = useMemo(() => {
        const calculations = new Map()
        availableItems.forEach(item => {
            const words = item.word.split(' ')
            const longestWord = Math.max(...words.map(w => w.length))
            const totalChars = item.word.replace(/\s/g, '').length

            let inputSizeClass = 'w-3 h-3 sm:w-4 sm:h-4 text-xs'
            if (longestWord <= 3) inputSizeClass = 'w-8 h-8 sm:w-9 sm:h-9 text-lg sm:text-xl'
            else if (longestWord <= 5) inputSizeClass = 'w-6 h-6 sm:w-7 sm:h-7 text-base sm:text-lg'
            else if (longestWord <= 7) inputSizeClass = 'w-5 h-5 sm:w-6 sm:h-6 text-sm sm:text-base'
            else if (longestWord <= 9) inputSizeClass = 'w-4 h-4 sm:w-5 sm:h-5 text-xs sm:text-sm'

            const gapClass = longestWord > 7 ? 'gap-0.5 sm:gap-1' : longestWord > 5 ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'

            let padding = '0.375rem 0.375rem'
            if (longestWord <= 4) padding = '0.75rem 1rem'
            else if (longestWord <= 6) padding = '0.5rem 0.75rem'
            else if (longestWord <= 8) padding = '0.5rem 0.5rem'

            let cardWidth = `${Math.min(24, longestWord * 2.2 + 8)}rem`
            if (totalChars <= 4) cardWidth = '12rem'
            else if (totalChars <= 6) cardWidth = '14rem'
            else if (totalChars <= 8) cardWidth = '16rem'
            else if (totalChars <= 10) cardWidth = '18rem'
            else if (totalChars <= 12) cardWidth = '20rem'

            calculations.set(item.id, {
                words,
                longestWord,
                totalChars,
                inputSizeClass,
                gapClass,
                padding,
                cardWidth
            })
        })
        return calculations
    }, [availableItems])

    // const isAllCompleted = useMemo(() =>
    //     availableItems.length > 0 && completedItems.size === availableItems.length,
    //     [availableItems.length, completedItems.size]
    // )

    // Play sound effect - memoized
    const playSound = useCallback((soundType: 'correct' | 'wrong') => {
        const audio = new Audio(`/sfx/${soundType}_01.mp3`)
        audio.volume = 0.3
        audio.play().catch(() => { })
    }, [])

    // Check if the answer is correct - memoized
    const checkAnswer = useCallback((itemId: number) => {
        const item = availableItems.find(item => item.id === itemId)
        if (!item || !inputValues[itemId]) return

        const userAnswer = inputValues[itemId].join('').toUpperCase()
        const correctAnswer = item.word.replace(/\s/g, '').toUpperCase()

        if (userAnswer === correctAnswer) {
            playSound('correct')
            setShowSuccess(itemId)

            setTimeout(() => {
                setCompletedItems(prev => {
                    const newCompletedItems = new Set([...prev, itemId])
                    // Save to cookies immediately
                    saveCompletedItemsToCookie(newCompletedItems)
                    return newCompletedItems
                })
                setOpenedBoxId(null)
                setShowSuccess(null)
                setInputValues(prev => {
                    const newValues = { ...prev }
                    delete newValues[itemId]
                    return newValues
                })
            }, 1500)
        } else if (userAnswer.length === correctAnswer.length) {
            playSound('wrong')
            setShowError(itemId)

            // Clear all input fields after a small delay when answer is wrong
            setTimeout(() => {
                setInputValues(prev => ({
                    ...prev,
                    [itemId]: new Array(correctAnswer.length).fill('')
                }))

                // Focus the first input field after clearing
                setTimeout(() => {
                    const firstInput = document.getElementById(`input-${itemId}-0`)
                    firstInput?.focus()
                }, 100)
            }, 800)

            setTimeout(() => setShowError(null), 1000)
        }
    }, [availableItems, inputValues, playSound])

    // Function to clear all completed items (useful for testing or reset)
    // const clearAllCompleted = useCallback(() => {
    //     console.log('Clearing all completed items')
    //     setCompletedItems(new Set())
    //     setCookie(COOKIE_NAME, '[]', COOKIE_EXPIRY_DAYS)
    // }, [])

    // Initialize input values for a word - memoized
    const initializeInputs = useCallback((itemId: number, wordLength: number) => {
        setInputValues(prev => ({
            ...prev,
            [itemId]: new Array(wordLength).fill('')
        }))
    }, [])

    // Handle input change - memoized
    const handleInputChange = useCallback((itemId: number, index: number, value: string) => {
        if (value.length > 1) return

        setInputValues(prev => {
            const newValues = { ...prev }
            if (!newValues[itemId]) {
                newValues[itemId] = new Array(availableItems.find(item => item.id === itemId)?.word.replace(/\s/g, '').length || 0).fill('')
            }
            newValues[itemId][index] = value.toUpperCase()
            setTimeout(() => checkAnswer(itemId), 0)
            return newValues
        })

        if (value) {
            const totalInputs = availableItems.find(item => item.id === itemId)?.word.replace(/\s/g, '').length || 0
            if (index < totalInputs - 1) {
                const nextInput = document.getElementById(`input-${itemId}-${index + 1}`)
                nextInput?.focus()
            }
        }
    }, [availableItems, checkAnswer])

    // Handle backspace to go to previous input - memoized
    const handleKeyDown = useCallback((itemId: number, index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !inputValues[itemId]?.[index] && index > 0) {
            const prevInput = document.getElementById(`input-${itemId}-${index - 1}`)
            prevInput?.focus()
        }
    }, [inputValues])

    useEffect(() => {
        // Load mystery box items
        const loadMysteryBoxItems = async () => {
            try {
                const result = await getMysteryBoxItems()
                if (result.success && result.data) {
                    // Filter active items and cast the type properly
                    const activeItems = result.data
                        .filter(item => item.status === 'active')
                        .map(item => ({
                            ...item,
                            status: item.status as 'active' | 'inactive'
                        }))
                    setAvailableItems(activeItems)
                }
            } catch (error) {
                console.error('Error loading mystery box items:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadMysteryBoxItems()
    }, [])

    // Handle click outside to close active card
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openedBoxId === null) return

            const target = event.target as Element
            // Check if the click is on an active card or its children
            const activeCard = document.querySelector(`[data-card-id="${openedBoxId}"]`)
            const mysteryBox = document.querySelector(`[data-box-id="${openedBoxId}"]`)

            // Don't close if clicking on the card itself or the mystery box
            if (activeCard?.contains(target) || mysteryBox?.contains(target)) {
                return
            }

            // Close the card if clicking outside
            setOpenedBoxId(null)
        }

        // Add event listener when a card is open
        if (openedBoxId !== null) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [openedBoxId])

    // Don't filter out completed items anymore - keep them visible
    // useEffect(() => {
    //     setAvailableItems(prev =>
    //         prev.filter(item => !completedItems.has(item.id))
    //     )
    // }, [completedItems])

    const handleItemClick = useCallback((item: MysteryBoxItem) => {
        if (openedBoxId === item.id) {
            setOpenedBoxId(null)
        } else {
            // Immediately set the opened box to trigger the box animation
            setOpenedBoxId(item.id)

            // Prepare the input values first
            if (completedItems.has(item.id)) {
                // Pre-fill with the correct answer for viewing
                const correctAnswer = item.word.replace(/\s/g, '').toUpperCase()
                setInputValues(prev => ({
                    ...prev,
                    [item.id]: correctAnswer.split('')
                }))
            } else {
                // Initialize empty inputs for incomplete items
                const wordWithoutSpaces = item.word.replace(/\s/g, '')
                initializeInputs(item.id, wordWithoutSpaces.length)
            }
        }
    }, [completedItems, openedBoxId, initializeInputs])

    if (isLoading) {
        return (
            <div className="text-center py-8 sm:py-12 px-4">
                <Gift className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-600">Nag lo-load ang mga kahon ng misteryo...</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-2">Mangyaring maghintay habang inihahanda namin ang iyong mga palaisipan!</p>
            </div>
        )
    }

    if (!availableItems.length && !isLoading) {
        return (
            <div className="text-center py-8 sm:py-12 px-4">
                <Gift className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-600">Walang laman ang mystery box</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-2">Bumalik muli mamaya para sa mga bagong palaisipan!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="text-center px-4 sm:px-6">
                {/* Back Button */}
                <div className="flex justify-start mb-4 sm:mb-6">
                    <Link
                        href="/mga-laro"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span>Bumalik sa mga Laro</span>
                    </Link>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kahon ng Misteryo</h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    I-click ang kahon ng misteryo upang ibunyag ang palaisipan!
                </p>
            </div>

            {/* Mystery Items - Clean Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 px-4 sm:px-6 place-items-center max-w-7xl mx-auto">
                <AnimatePresence>
                    {availableItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            className="relative flex flex-col items-center w-full max-w-sm cursor-pointer"
                            onClick={() => handleItemClick(item)}
                        >
                            {/* Mystery Box Image Container */}
                            <div className="relative" data-box-id={item.id}>
                                <MysteryBoxImage
                                    isOpen={openedBoxId === item.id}
                                    isCompleted={completedItems.has(item.id)}
                                    boxNumber={index + 1}
                                    size="lg"
                                    colorVariant={getBoxColor(item.id)}
                                // className="mb-4 sm:mb-6"
                                />

                                {/* Card that pops out */}
                                <AnimatePresence mode="wait">
                                    {openedBoxId === item.id && (
                                        <motion.div
                                            variants={cardVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            transition={{
                                                duration: 0.6,
                                                ease: [0.4, 0, 0.2, 1],
                                                delay: 0.3 // Delay the card appearance to see box animation first
                                            }}
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                                        >
                                            {/* Card */}
                                            <div
                                                data-card-id={item.id}
                                                className={`rounded-xl p-2 sm:p-3 lg:p-4 shadow-2xl border-2 sm:border-4 relative overflow-hidden ${completedItems.has(item.id)
                                                        ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300'
                                                        : 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300'
                                                    }`}
                                                style={{
                                                    minWidth: '10rem',
                                                    width: itemCalculations.get(item.id)?.cardWidth || '12rem',
                                                    maxWidth: '85vw'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Success Overlay */}
                                                <AnimatePresence>
                                                    {showSuccess === item.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="absolute inset-0 bg-green-500/90 rounded-xl flex items-center justify-center z-10"
                                                        >
                                                            <div className="text-center text-white">
                                                                <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2" />
                                                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Tama!</h3>
                                                                <p className="text-sm sm:text-base lg:text-lg">Magaling!</p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {/* Card Image */}
                                                <div className="bg-white rounded-lg p-1 sm:p-2 lg:p-3 mb-2 sm:mb-3 aspect-square flex items-center justify-center mx-auto max-w-24 sm:max-w-32 lg:max-w-36">
                                                    {item.imageUrl ? (
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt="Misteriosong item"
                                                            width={100}
                                                            height={100}
                                                            className="max-w-full max-h-full object-contain rounded sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px]"
                                                        />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Gift size={30} className="mx-auto text-purple-400 mb-1 sm:mb-2 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                                                            <p className="text-gray-500 text-xs sm:text-sm">Walang Larawan</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <div className="text-center">
                                                    {item.description && (
                                                        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                                                            {completedItems.has(item.id) && (
                                                                <span className="inline-flex items-center text-green-600 font-medium mb-2">
                                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                    Tapos na!
                                                                </span>
                                                            )}
                                                            <br />
                                                            {item.description}
                                                        </p>
                                                    )}                                                            {/* Answer blanks - Responsive word layout */}
                                                    <div className="flex justify-center mb-3 sm:mb-4">
                                                        <motion.div
                                                            className="bg-white/90 rounded-lg"
                                                            style={{
                                                                padding: itemCalculations.get(item.id)?.padding || '0.375rem 0.375rem',
                                                                minWidth: 'fit-content',
                                                                width: 'auto'
                                                            }}
                                                            animate={showError === item.id ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                                                            transition={{ duration: 0.5 }}
                                                        >
                                                            {(() => {
                                                                const words = item.word.split(' ')
                                                                // const totalChars = item.word.replace(/\s/g, '').length

                                                                // Determine input size based on longest word to ensure proper fit
                                                                const getInputSize = () => {
                                                                    const longestWord = Math.max(...words.map(w => w.length))

                                                                    // More conservative sizing to ensure containment
                                                                    if (longestWord <= 3) {
                                                                        return 'w-8 h-8 sm:w-9 sm:h-9 text-lg sm:text-xl'
                                                                    }
                                                                    if (longestWord <= 5) {
                                                                        return 'w-6 h-6 sm:w-7 sm:h-7 text-base sm:text-lg'
                                                                    }
                                                                    if (longestWord <= 7) {
                                                                        return 'w-5 h-5 sm:w-6 sm:h-6 text-sm sm:text-base'
                                                                    }
                                                                    if (longestWord <= 9) {
                                                                        return 'w-4 h-4 sm:w-5 sm:h-5 text-xs sm:text-sm'
                                                                    }
                                                                    return 'w-3 h-3 sm:w-4 sm:h-4 text-xs'
                                                                }

                                                                const inputSizeClass = getInputSize()
                                                                let currentInputIndex = 0

                                                                return (
                                                                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                                                                        {words.map((word, wordIndex) => {
                                                                            const longestWord = Math.max(...words.map(w => w.length))
                                                                            const gapClass = longestWord > 7 ? 'gap-0.5 sm:gap-1' : longestWord > 5 ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'
                                                                            return (
                                                                                <div key={wordIndex} className={`flex justify-center items-center ${gapClass}`}>
                                                                                    {word.split('').map((char, charIndex) => {
                                                                                        const inputIndex = currentInputIndex++
                                                                                        return (
                                                                                            <input
                                                                                                key={`input-${wordIndex}-${charIndex}`}
                                                                                                id={`input-${item.id}-${inputIndex}`}
                                                                                                type="text"
                                                                                                maxLength={1}
                                                                                                value={inputValues[item.id]?.[inputIndex] || ''}
                                                                                                onChange={(e) => !completedItems.has(item.id) ? handleInputChange(item.id, inputIndex, e.target.value) : undefined}
                                                                                                onKeyDown={(e) => !completedItems.has(item.id) ? handleKeyDown(item.id, inputIndex, e) : undefined}
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                                onFocus={(e) => e.stopPropagation()}
                                                                                                spellCheck={false}
                                                                                                autoComplete="off"
                                                                                                readOnly={completedItems.has(item.id)}
                                                                                                className={`${inputSizeClass} text-center border-2 rounded-md font-bold text-gray-800 focus:outline-none bg-white shadow-sm transition-colors ${completedItems.has(item.id)
                                                                                                        ? 'border-green-500 bg-green-50 cursor-default'
                                                                                                        : showError === item.id
                                                                                                            ? 'border-red-500 bg-red-50'
                                                                                                            : 'border-gray-300 focus:border-purple-500'
                                                                                                    }`}
                                                                                            />
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )
                                                            })()}
                                                        </motion.div>
                                                    </div>

                                                    <div
                                                        className="text-xs sm:text-sm text-gray-600 bg-white/70 rounded-full px-3 sm:px-4 py-1 sm:py-2 cursor-pointer hover:bg-white/90 transition-all duration-200"
                                                        onClick={() => setOpenedBoxId(null)}
                                                    >
                                                        {completedItems.has(item.id) ? 'Tapos na ✓' : 'I-click upang isara'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating animation for closed boxes (only for non-completed items) */}
                                {openedBoxId !== item.id && !completedItems.has(item.id) && (
                                    <motion.div
                                        animate={floatingAnimation}
                                        className="absolute inset-0"
                                    />
                                )}
                            </div>

                            {/* Item info below the box (only show when closed) */}
                            <AnimatePresence>
                                {openedBoxId !== item.id && (
                                    <motion.div
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center"
                                    >
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                                            #{index + 1}
                                        </h3>

                                        {/* {item.description && (
                                                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 max-w-32 sm:max-w-48 mx-auto">
                                                        {completedItems.has(item.id) ? 'Nasagutan na!' : ''}
                                                    </p>
                                                )} */}

                                        {/* <span className={`inline-block text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg transition-all ${completedItems.has(item.id)
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 cursor-default'
                                                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-xl cursor-pointer'
                                                    }`}>
                                                    {completedItems.has(item.id) ? 'Tapos na ✓' : 'I-click para buksan'}
                                                </span> */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Completed Message */}
            {/* {isAllCompleted && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8 sm:py-12 px-4"
                >
                    <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-green-500 mb-3 sm:mb-4" />
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-2">Binabati kita!</h2>
                    <p className="text-base sm:text-lg text-gray-600">Natapos mo na ang lahat ng mystery items!</p>
                </motion.div>
            )} */}

            {/* Debug: Reset Progress Button - Remove this in production */}
            {/* TODO: REMOVE THIS BEFORE PUSHING */}
            {/* {process.env.NODE_ENV === 'development' && completedItems.size > 0 && (
                <div className="text-center py-4">
                    <button
                        onClick={clearAllCompleted}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                    >
                        Reset Progress (Dev Only)
                    </button>
                </div>
            )} */}
        </div>
    )
}
