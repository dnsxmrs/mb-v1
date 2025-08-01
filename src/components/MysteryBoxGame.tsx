'use client'

import { useState, useEffect } from 'react'
import { Gift, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { MysteryBoxItem } from '@/actions/mystery-box'
import Link from 'next/link'

interface MysteryBoxGameProps {
    mysteryBoxItems: MysteryBoxItem[]
}

export default function MysteryBoxGame({ mysteryBoxItems }: MysteryBoxGameProps) {
    const [selectedItem, setSelectedItem] = useState<MysteryBoxItem | null>(null)
    const [userAnswer, setUserAnswer] = useState('')
    const [showResult, setShowResult] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())
    const [availableItems, setAvailableItems] = useState<MysteryBoxItem[]>(mysteryBoxItems)

    // Reset available items when mysteryBoxItems changes
    useEffect(() => {
        setAvailableItems(mysteryBoxItems.filter(item =>
            !completedItems.has(item.id) && item.status === 'active'
        ))
    }, [mysteryBoxItems, completedItems])

    const handleItemClick = (item: MysteryBoxItem) => {
        setSelectedItem(item)
        setUserAnswer('')
        setShowResult(false)
        setIsCorrect(false)
    }

    const handleSubmitAnswer = () => {
        if (!selectedItem || !userAnswer.trim()) return

        const correct = userAnswer.toLowerCase().trim() === selectedItem.word.toLowerCase().trim()
        setIsCorrect(correct)
        setShowResult(true)

        if (correct) {
            // Add to completed items
            setCompletedItems(prev => new Set([...prev, selectedItem.id]))

            // Play success sound (if available)
            if (typeof window !== 'undefined') {
                const audio = new Audio('/sfx/correct_01.mp3')
                audio.play().catch(() => { })
            }

            // Auto close modal after success animation
            setTimeout(() => {
                setSelectedItem(null)
                setShowResult(false)
            }, 2000)
        } else {
            // Play error sound (if available)
            if (typeof window !== 'undefined') {
                const audio = new Audio('/sfx/wrong_01.mp3')
                audio.play().catch(() => { })
            }
        }
    }

    const closeModal = () => {
        setSelectedItem(null)
        setShowResult(false)
        setUserAnswer('')
        setIsCorrect(false)
    }

    const createBlankWord = (word: string) => {
        return word.split('').map((char) =>
            char === ' ' ? ' ' : '___'
        ).join(' ')
    }

    if (!mysteryBoxItems.length) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {availableItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative cursor-pointer"
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl p-8 shadow-lg border-2 border-transparent hover:border-purple-300 transition-all duration-300">
                                {/* Mystery Box Animation */}
                                <motion.div
                                    animate={{
                                        rotateY: [0, 10, -10, 0],
                                        y: [0, -5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                    className="text-center"
                                >
                                    <Gift className="mx-auto h-16 w-16 text-white mb-4" />
                                </motion.div>

                                <h3 className="text-xl font-bold text-white text-center mb-2">
                                    Mystery Item #{item.id}
                                </h3>

                                {item.description && (
                                    <p className="text-purple-100 text-center text-sm mb-4">
                                        {item.description}
                                    </p>
                                )}

                                <div className="text-center">
                                    <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                                        Click to reveal
                                    </span>
                                </div>
                            </div>
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

            {/* Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* Success/Error Overlay */}
                            <AnimatePresence>
                                {showResult && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`absolute inset-0 rounded-2xl flex items-center justify-center ${isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'
                                            }`}
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 15 }}
                                            className="text-center text-white"
                                        >
                                            {isCorrect ? (
                                                <>
                                                    <CheckCircle size={64} className="mx-auto mb-4" />
                                                    <h3 className="text-2xl font-bold">Correct!</h3>
                                                    <p className="text-lg">Well done!</p>
                                                </>
                                            ) : (
                                                <>
                                                    <X size={64} className="mx-auto mb-4" />
                                                    <h3 className="text-2xl font-bold">Try Again!</h3>
                                                    <p className="text-lg">The answer is: {selectedItem.word}</p>
                                                </>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Modal Content */}
                            <div className="text-center space-y-6">
                                <h2 className="text-2xl font-bold text-purple-800">
                                    Mystery Item #{selectedItem.id}
                                </h2>

                                {/* Image placeholder or actual image */}
                                <div className="bg-gray-100 rounded-lg p-8 aspect-square flex items-center justify-center">
                                    {selectedItem.imageUrl ? (
                                        <Image
                                            src={selectedItem.imageUrl}
                                            alt="Mystery item"
                                            width={300}
                                            height={300}
                                            className="max-w-full max-h-full object-contain rounded"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <Gift size={64} className="mx-auto text-purple-400 mb-2" />
                                            <p className="text-gray-500">Image placeholder</p>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedItem.description && (
                                    <p className="text-gray-600 italic">
                                        &ldquo;{selectedItem.description}&rdquo;
                                    </p>
                                )}

                                {/* Blank word */}
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-lg font-mono tracking-wider">
                                        {createBlankWord(selectedItem.word)}
                                    </p>
                                </div>

                                {/* Input and Submit */}
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                                        placeholder="Type your answer..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        disabled={showResult}
                                    />

                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!userAnswer.trim() || showResult}
                                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Submit Answer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
