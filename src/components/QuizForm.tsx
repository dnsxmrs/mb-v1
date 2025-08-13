'use client'

import { Trash2, Plus } from 'lucide-react'
import { useSystemConfig } from '@/hooks/useSystemConfig'

interface Choice {
    id: number
    text: string
}

interface QuizItem {
    id?: number
    quizNumber: number
    question: string
    choices: Choice[]
    correctAnswer: number | null // store the id of the correct choice
}

interface QuizFormProps {
    quizItems: QuizItem[]
    onQuizItemsChange: (quizItems: QuizItem[]) => void
    disabled?: boolean
}

let choiceIdCounter = 1

export default function QuizForm({ quizItems, onQuizItemsChange, disabled = false }: QuizFormProps) {
    const { config } = useSystemConfig()

    const addQuizItem = () => {
        const defaultChoicesCount = config?.defaultChoicesCount || 2
        const defaultChoices = Array.from({ length: defaultChoicesCount }, () => ({
            id: choiceIdCounter++,
            text: ''
        }))

        const newQuizItem: QuizItem = {
            quizNumber: quizItems.length + 1,
            question: '',
            choices: defaultChoices,
            correctAnswer: null
        }
        onQuizItemsChange([...quizItems, newQuizItem])
    }

    const removeQuizItem = (index: number) => {
        const updatedItems = quizItems.filter((_, i) => i !== index)
        // Renumber the remaining items
        const renumberedItems = updatedItems.map((item, i) => ({
            ...item,
            quizNumber: i + 1
        }))
        onQuizItemsChange(renumberedItems)
    }

    const updateQuizItem = (index: number, field: keyof QuizItem, value: string | number | null) => {
        const updatedItems = quizItems.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        )
        onQuizItemsChange(updatedItems)
    }

    const updateChoice = (quizIndex: number, choiceIndex: number, value: string) => {
        const updatedItems = quizItems.map((item, i) => {
            if (i === quizIndex) {
                const newChoices = [...item.choices]
                newChoices[choiceIndex] = { ...newChoices[choiceIndex], text: value }
                return { ...item, choices: newChoices }
            }
            return item
        })
        onQuizItemsChange(updatedItems)
    }

    const addChoice = (quizIndex: number) => {
        const updatedItems = quizItems.map((item, i) => {
            if (i === quizIndex) {
                return {
                    ...item,
                    choices: [...item.choices, { id: choiceIdCounter++, text: '' }]
                }
            }
            return item
        })
        onQuizItemsChange(updatedItems)
    }

    const removeChoice = (quizIndex: number, choiceIndex: number) => {
        const minChoicesCount = config?.minChoicesCount || 2
        const updatedItems = quizItems.map((item, i) => {
            if (i === quizIndex && item.choices.length > minChoicesCount) {
                const removedChoice = item.choices[choiceIndex]
                const newChoices = item.choices.filter((_, idx) => idx !== choiceIndex)
                // If the removed choice was the correct answer, unset correctAnswer
                let correctAnswer = item.correctAnswer
                if (removedChoice.id === item.correctAnswer) {
                    correctAnswer = null
                }
                return { ...item, choices: newChoices, correctAnswer }
            }
            return item
        })
        onQuizItemsChange(updatedItems)
    }

    const moveQuizItem = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= quizItems.length) return

        const updatedItems = [...quizItems]
        const [movedItem] = updatedItems.splice(fromIndex, 1)
        updatedItems.splice(toIndex, 0, movedItem)

        // Renumber all items
        const renumberedItems = updatedItems.map((item, i) => ({
            ...item,
            quizNumber: i + 1
        }))
        onQuizItemsChange(renumberedItems)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Mga Tanong sa Quiz</h3>
                {/* <button
                    type="button"
                    onClick={addQuizItem}
                    disabled={disabled}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Question
                </button> */}
            </div>

            {quizItems.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mx-2 sm:mx-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 px-4">Wala pang mga tanong sa quiz</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">Magdagdag ng mga tanong para gumawa ng interactive na quiz para sa inyong kuwento</p>
                    <button
                        type="button"
                        onClick={addQuizItem}
                        disabled={disabled}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md text-base"
                    >
                        Magdagdag ng Inyong Unang Tanong
                    </button>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {quizItems.map((quizItem, quizIndex) => (
                        <div key={quizIndex}>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm mx-2 sm:mx-0">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                    {/* Drag Handle */}
                                    {/* <div className="flex flex-col items-center gap-2 pt-2">
                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                        <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                                            {quizIndex + 1}
                                        </span>
                                    </div> */}

                                    <div className="flex-1 space-y-3 sm:space-y-4">
                                        {/* Question Number - Mobile Only */}
                                        <div className="sm:hidden">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                                {quizIndex + 1}
                                            </span>
                                        </div>

                                        {/* Question */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanong <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={quizItem.question}
                                                onChange={(e) => updateQuizItem(quizIndex, 'question', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                                placeholder="Ilagay ang inyong tanong dito..."
                                                disabled={disabled}
                                            />
                                        </div>

                                        {/* Choices */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mga Pagpipilian sa Sagot <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-3">
                                                {quizItem.choices.map((choice, choiceIndex) => (
                                                    <div key={choice.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-md sm:rounded-none">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <input
                                                                type="radio"
                                                                name={`correct-answer-${quizIndex}`}
                                                                checked={quizItem.correctAnswer === choice.id}
                                                                onChange={() => updateQuizItem(quizIndex, 'correctAnswer', choice.id)}
                                                                className="text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-auto sm:h-auto"
                                                                disabled={disabled || choice.text.trim() === ''}
                                                            />
                                                            <span className="text-sm font-medium text-gray-600 w-6 flex-shrink-0">
                                                                {String.fromCharCode(65 + choiceIndex)}.
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <input
                                                                type="text"
                                                                value={choice.text}
                                                                onChange={(e) => updateChoice(quizIndex, choiceIndex, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                                                placeholder={`Pagpipilian ${String.fromCharCode(65 + choiceIndex)}`}
                                                                disabled={disabled}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeChoice(quizIndex, choiceIndex)}
                                                                disabled={disabled || quizItem.choices.length <= (config?.minChoicesCount || 2)}
                                                                className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 touch-manipulation"
                                                                title="Tanggalin ang pagpipilian"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addChoice(quizIndex)}
                                                disabled={disabled || quizItem.choices.length >= (config?.maxChoicesCount || 10)}
                                                className="mt-3 text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                            >
                                                + Magdagdag ng Pagpipilian {config?.maxChoicesCount && quizItem.choices.length >= config.maxChoicesCount ? `(Max: ${config.maxChoicesCount})` : ''}
                                            </button>
                                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                                Piliin ang radio button sa tabi ng tamang sagot
                                                {config && (
                                                    <span className="block mt-1">
                                                        Mga Pagpipilian: {config.minChoicesCount} - {config.maxChoicesCount} ang pwede
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions - Mobile: Bottom, Desktop: Right */}
                                    <div className="flex sm:flex-col justify-center sm:justify-start gap-3 sm:gap-2 order-first sm:order-last">
                                        <div className="hidden sm:block">
                                            <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                                                {quizIndex + 1}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 sm:flex-col sm:gap-2">
                                            <button
                                                type="button"
                                                onClick={() => moveQuizItem(quizIndex, quizIndex - 1)}
                                                disabled={disabled || quizIndex === 0}
                                                className="p-2 sm:p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 sm:bg-transparent rounded-md sm:rounded-none hover:bg-gray-200 sm:hover:bg-transparent touch-manipulation"
                                                title="Ilipat pataas"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveQuizItem(quizIndex, quizIndex + 1)}
                                                disabled={disabled || quizIndex === quizItems.length - 1}
                                                className="p-2 sm:p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 sm:bg-transparent rounded-md sm:rounded-none hover:bg-gray-200 sm:hover:bg-transparent touch-manipulation"
                                                title="Ilipat pababa"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeQuizItem(quizIndex)}
                                                disabled={disabled}
                                                className="p-2 sm:p-1 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed bg-red-50 sm:bg-transparent rounded-md sm:rounded-none hover:bg-red-100 sm:hover:bg-transparent touch-manipulation"
                                                title="Tanggalin ang tanong"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add Question Button only after the last card */}
                            {quizIndex === quizItems.length - 1 && (
                                <div className="flex justify-center mt-3 sm:mt-2">
                                    <button
                                        type="button"
                                        onClick={addQuizItem}
                                        disabled={disabled}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 px-5 sm:py-1.5 sm:px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:gap-1.5 shadow-sm touch-manipulation"
                                        title="Magdagdag ng tanong pagkatapos nito"
                                    >
                                        <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                        Magdagdag ng Tanong
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
