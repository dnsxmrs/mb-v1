'use client'

import { Trash2, Plus } from 'lucide-react'

interface QuizItem {
    id?: number
    quizNumber: number
    question: string
    choices: string[]
    correctAnswer: string
}

interface QuizFormProps {
    quizItems: QuizItem[]
    onQuizItemsChange: (quizItems: QuizItem[]) => void
    disabled?: boolean
}

export default function QuizForm({ quizItems, onQuizItemsChange, disabled = false }: QuizFormProps) {
    const addQuizItem = () => {
        const newQuizItem: QuizItem = {
            quizNumber: quizItems.length + 1,
            question: '',
            choices: ['', '', '', ''],
            correctAnswer: ''
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

    const updateQuizItem = (index: number, field: keyof QuizItem, value: string | number | string[]) => {
        const updatedItems = quizItems.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        )
        onQuizItemsChange(updatedItems)
    }

    const updateChoice = (quizIndex: number, choiceIndex: number, value: string) => {
        const updatedItems = quizItems.map((item, i) => {
            if (i === quizIndex) {
                const newChoices = [...item.choices]
                newChoices[choiceIndex] = value
                return { ...item, choices: newChoices }
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Quiz Questions</h3>
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
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-4xl mb-2">❓</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz questions yet</h3>
                    <p className="text-gray-600 mb-4">Add questions to create an interactive quiz for your story</p>
                    <button
                        type="button"
                        onClick={addQuizItem}
                        disabled={disabled}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                    >
                        Add Your First Question
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {quizItems.map((quizItem, quizIndex) => (
                        <div key={quizIndex}>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    {/* Drag Handle */}
                                    {/* <div className="flex flex-col items-center gap-2 pt-2">
                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                        <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                                            {quizIndex + 1}
                                        </span>
                                    </div> */}

                                    <div className="flex-1 space-y-4">
                                        {/* Question */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Question <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={quizItem.question}
                                                onChange={(e) => updateQuizItem(quizIndex, 'question', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter your question here..."
                                                disabled={disabled}
                                            />
                                        </div>

                                        {/* Choices */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Answer Choices <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                {quizItem.choices.map((choice, choiceIndex) => (
                                                    <div key={choiceIndex} className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name={`correct-answer-${quizIndex}`}
                                                            checked={quizItem.correctAnswer === choice && choice.trim() !== ''}
                                                            onChange={() => updateQuizItem(quizIndex, 'correctAnswer', choice)}
                                                            className="text-blue-600 focus:ring-blue-500"
                                                            disabled={disabled || choice.trim() === ''}
                                                        />
                                                        <span className="text-sm font-medium text-gray-600 w-6">
                                                            {String.fromCharCode(65 + choiceIndex)}.
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={choice}
                                                            onChange={(e) => updateChoice(quizIndex, choiceIndex, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                                                            disabled={disabled}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Select the radio button next to the correct answer
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveQuizItem(quizIndex, quizIndex - 1)}
                                            disabled={disabled || quizIndex === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveQuizItem(quizIndex, quizIndex + 1)}
                                            disabled={disabled || quizIndex === quizItems.length - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeQuizItem(quizIndex)}
                                            disabled={disabled}
                                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Delete question"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Add Question Button only after the last card */}
                            {quizIndex === quizItems.length - 1 && (
                                <div className="flex justify-center mt-2">
                                    <button
                                        type="button"
                                        onClick={addQuizItem}
                                        disabled={disabled}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                                        title="Add question after this one"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Question
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
