'use client'

import { useState, useEffect } from 'react'
import { Gift, CheckCircle, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { getMysteryBoxItems, type MysteryBoxItem } from "@/actions/mystery-box"

export default function MysteryBoxGame() {
    const [selectedItem, setSelectedItem] = useState<MysteryBoxItem | null>(null)
    const [userAnswer, setUserAnswer] = useState('')
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())
    const [availableItems, setAvailableItems] = useState<MysteryBoxItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [openedBoxId, setOpenedBoxId] = useState<number | null>(null)
    const [inputValues, setInputValues] = useState<{ [key: number]: string[] }>({})

    // Initialize input values for a word
    const initializeInputs = (itemId: number, wordLength: number) => {
        setInputValues(prev => ({
            ...prev,
            [itemId]: new Array(wordLength).fill('')
        }))
    }

    // Handle input change
    const handleInputChange = (itemId: number, index: number, value: string) => {
        if (value.length > 1) return // Only allow single character

        setInputValues(prev => {
            const newValues = { ...prev }
            if (!newValues[itemId]) {
                newValues[itemId] = new Array(availableItems.find(item => item.id === itemId)?.word.replace(/\s/g, '').length || 0).fill('')
            }
            newValues[itemId][index] = value.toUpperCase()
            return newValues
        })

        // Auto-focus next input
        if (value && index < (inputValues[itemId]?.length || 0) - 1) {
            const nextInput = document.getElementById(`input-${itemId}-${index + 1}`)
            if (nextInput) {
                nextInput.focus()
            }
        }
    }

    // Handle backspace to go to previous input
    const handleKeyDown = (itemId: number, index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !inputValues[itemId]?.[index] && index > 0) {
            const prevInput = document.getElementById(`input-${itemId}-${index - 1}`)
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

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

    // Update available items when items are completed
    useEffect(() => {
        setAvailableItems(prev =>
            prev.filter(item => !completedItems.has(item.id))
        )
    }, [completedItems])

    const handleItemClick = (item: MysteryBoxItem) => {
        if (openedBoxId === item.id) {
            setOpenedBoxId(null) // Close if already open
        } else {
            setOpenedBoxId(item.id) // Open this box
            // Initialize inputs for this word (excluding spaces)
            const wordWithoutSpaces = item.word.replace(/\s/g, '')
            initializeInputs(item.id, wordWithoutSpaces.length)
        }
    }

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <Gift className="mx-auto h-16 w-16 text-gray-400 mb-4 animate-pulse" />
                <h3 className="text-xl font-medium text-gray-600">Loading mystery boxes...</h3>
                <p className="text-gray-500 mt-2">Please wait while we prepare your puzzles!</p>
            </div>
        )
    }

    if (!availableItems.length && !isLoading) {
        return (
            <div className="text-center py-12">
                <Gift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-600">No mystery box items available</h3>
                <p className="text-gray-500 mt-2">Check back later for new puzzles!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="text-center px-4">
                {/* Back Button */}
                <div className="flex justify-start mb-6">
                    <Link
                        href="/games"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Games</span>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mystery Box</h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Click on a mystery box to reveal a puzzle!
                </p>
            </div>

            {/* Mystery Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                <AnimatePresence>
                    {availableItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            className="relative cursor-pointer flex flex-col items-center"
                            onClick={() => handleItemClick(item)}
                            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                        >
                            {/* 3D Mystery Box Container */}
                            <div className="relative w-40 h-40 mb-6">
                                {/* Box Base/Bottom */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-lg"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Bottom face */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg" />

                                    {/* Side faces */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg"
                                        style={{
                                            transform: 'rotateY(90deg) translateZ(80px)',
                                            transformOrigin: 'right'
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-l from-gray-600 to-gray-800 rounded-lg"
                                        style={{
                                            transform: 'rotateY(-90deg) translateZ(80px)',
                                            transformOrigin: 'left'
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg"
                                        style={{
                                            transform: 'rotateX(90deg) translateZ(80px)',
                                            transformOrigin: 'top'
                                        }}
                                    />

                                    {/* Question mark (disappears when opening) */}
                                    <AnimatePresence>
                                        {openedBoxId !== item.id && (
                                            <motion.div
                                                initial={{ opacity: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute inset-0 flex items-center justify-center z-10"
                                            >
                                                <span className="text-white text-6xl font-bold drop-shadow-lg">?</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Box Lid with Opening Animation */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg shadow-lg border-2 border-gray-500"
                                    style={{ transformStyle: 'preserve-3d', transformOrigin: 'bottom' }}
                                    animate={openedBoxId === item.id ? {
                                        rotateX: -130,
                                        y: -30,
                                        z: 40
                                    } : {
                                        rotateX: 0,
                                        y: 0,
                                        z: 0
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut",
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                >
                                    {/* Lid Top */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg" />

                                    {/* Lid highlight */}
                                    <div className="absolute top-2 left-2 right-2 h-4 bg-white/20 rounded-t-lg" />

                                    {/* Lid sides */}
                                    <div
                                        className="absolute top-0 left-0 w-full bg-gradient-to-r from-gray-600 to-gray-800"
                                        style={{
                                            transform: 'rotateY(90deg) translateZ(80px)',
                                            transformOrigin: 'left',
                                            width: '160px',
                                            height: '20px'
                                        }}
                                    />
                                    <div
                                        className="absolute top-0 right-0 w-full bg-gradient-to-l from-gray-700 to-gray-900"
                                        style={{
                                            transform: 'rotateY(-90deg) translateZ(80px)',
                                            transformOrigin: 'right',
                                            width: '160px',
                                            height: '20px'
                                        }}
                                    />
                                </motion.div>

                                {/* Card that pops out */}
                                <AnimatePresence>
                                    {openedBoxId === item.id && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 50,
                                                scale: 0.3,
                                                rotateX: -45
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: -80,
                                                scale: 1,
                                                rotateX: 0
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 50,
                                                scale: 0.3,
                                                rotateX: -45
                                            }}
                                            transition={{
                                                delay: 0.5,
                                                duration: 0.6,
                                                type: "spring",
                                                stiffness: 150,
                                                damping: 15
                                            }}
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                                        >
                                            {/* Card */}
                                            <div 
                                                className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 shadow-2xl border-4 border-amber-300"
                                                style={{ 
                                                    minWidth: '16rem', // 256px minimum
                                                    width: `${Math.max(16, (item.word.length * 3) + 8)}rem` // Dynamic width based on word length
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Card Image */}
                                                <div className="bg-white rounded-lg p-4 mb-4 aspect-square flex items-center justify-center mx-auto max-w-48">
                                                    {item.imageUrl ? (
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt="Mystery item"
                                                            width={140}
                                                            height={140}
                                                            className="max-w-full max-h-full object-contain rounded"
                                                        />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Gift size={50} className="mx-auto text-purple-400 mb-2" />
                                                            <p className="text-gray-500 text-sm">No Image</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <div className="text-center">
                                                    {item.description && (
                                                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    )}

                                                    {/* Answer blanks - Individual input boxes in single line */}
                                                    <div className="bg-white/90 p-4 rounded-lg mb-4">
                                                        <div className="flex justify-center items-center gap-2">
                                                            {item.word.split('').map((char, charIndex) => {
                                                                if (char === ' ') {
                                                                    return (
                                                                        <div 
                                                                            key={`space-${charIndex}`}
                                                                            className="w-4"
                                                                        />
                                                                    )
                                                                }
                                                                
                                                                // Get the actual input index (excluding spaces)
                                                                const inputIndex = item.word.substring(0, charIndex).replace(/\s/g, '').length
                                                                
                                                                return (
                                                                    <input
                                                                        key={`input-${charIndex}`}
                                                                        id={`input-${item.id}-${inputIndex}`}
                                                                        type="text"
                                                                        maxLength={1}
                                                                        value={inputValues[item.id]?.[inputIndex] || ''}
                                                                        onChange={(e) => handleInputChange(item.id, inputIndex, e.target.value)}
                                                                        onKeyDown={(e) => handleKeyDown(item.id, inputIndex, e)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onFocus={(e) => e.stopPropagation()}
                                                                        className="w-10 h-10 text-center border-2 border-gray-300 rounded-md text-base font-bold text-gray-800 focus:border-purple-500 focus:outline-none bg-white shadow-sm"
                                                                    />
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-gray-600 bg-white/70 rounded-full px-4 py-2">
                                                        Click to close
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating animation for closed boxes */}
                                {openedBoxId !== item.id && (
                                    <motion.div
                                        animate={{ y: [-3, 3, -3] }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
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
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            Mystery Item #{item.id}
                                        </h3>

                                        {item.description && (
                                            <p className="text-gray-600 text-sm mb-3 max-w-48 mx-auto">
                                                Tap to reveal!
                                            </p>
                                        )}

                                        <span className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow">
                                            Click to open
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Completed Message */}
            {availableItems.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
                    <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations!</h2>
                    <p className="text-lg text-gray-600">You&apos;ve completed all mystery items!</p>
                </motion.div>
            )}

        </div>
    )
}
