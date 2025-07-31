'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { createWordSearch, type WordSearchData } from '@/actions/word-search'
import toast from 'react-hot-toast'

interface AddContentModalProps {
    gameType: 'word-search' | 'mystery-box'
    onClose: () => void
    onSuccess?: () => void
}

export default function AddContentModal({ gameType, onClose, onSuccess }: AddContentModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'active',
        // Word Search specific
        words: [{ word: '', description: '' }],
        // Mystery Box specific
        questions: [{ question: '', answer: '', options: ['', '', '', ''] }],
        rewards: ['']
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (gameType === 'word-search') {
            setIsLoading(true)
            
            try {
                // Prepare data for word search
                const wordSearchData: WordSearchData = {
                    title: formData.title,
                    description: formData.description || undefined,
                    status: formData.status as 'active' | 'inactive',
                    words: formData.words.filter(wordObj => wordObj.word.trim() !== '')
                }

                const result = await createWordSearch(wordSearchData)

                if (result.success) {
                    toast.success(result.message || 'Word search created successfully!')
                    onSuccess?.()
                    onClose()
                } else {
                    toast.error(result.error || 'Failed to create word search')
                }
            } catch (error) {
                console.error('Error submitting form:', error)
                toast.error('An unexpected error occurred')
            } finally {
                setIsLoading(false)
            }
        } else {
            // Handle mystery box submission (placeholder for now)
            console.log('Mystery box form submitted:', formData)
            toast.success('Mystery box created successfully!')
            onClose()
        }
    }

    const addWord = () => {
        setFormData(prev => ({
            ...prev,
            words: [...prev.words, { word: '', description: '' }]
        }))
    }

    const removeWord = (index: number) => {
        setFormData(prev => ({
            ...prev,
            words: prev.words.filter((_, i) => i !== index)
        }))
    }

    const updateWord = (index: number, field: 'word' | 'description', value: string) => {
        setFormData(prev => ({
            ...prev,
            words: prev.words.map((wordObj, i) =>
                i === index ? { ...wordObj, [field]: value } : wordObj
            )
        }))
    }

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', answer: '', options: ['', '', '', ''] }]
        }))
    }

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }))
    }

    const updateQuestion = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        }))
    }

    const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === questionIndex
                    ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
                    : q
            )
        }))
    }

    const addReward = () => {
        setFormData(prev => ({
            ...prev,
            rewards: [...prev.rewards, '']
        }))
    }

    const removeReward = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rewards: prev.rewards.filter((_, i) => i !== index)
        }))
    }

    const updateReward = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            rewards: prev.rewards.map((reward, i) => i === index ? value : reward)
        }))
    }

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6">
                    <h2 className="text-xl font-semibold text-black">
                        Add {gameType === 'word-search' ? 'Word Search' : 'Mystery Box'} Content
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-black p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter title of the word search"
                                    maxLength={250}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter description of the word search"
                                    rows={3}
                                    maxLength={250}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    disabled
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                                    className="cursor-not-allowed text-gray-500 bg-gray-300 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">Active (default)</option>
                                </select>
                            </div>
                        </div>

                        {/* Word Search Content */}
                        {gameType === 'word-search' && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-black">
                                        Words <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    {formData.words.map((wordObj, index) => (
                                        <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-black">Word {index + 1}</h4>
                                                {formData.words.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeWord(index)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-black mb-1">
                                                        Word <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={wordObj.word}
                                                        onChange={(e) => updateWord(index, 'word', e.target.value)}
                                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter a word"
                                                        maxLength={250}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-black mb-1">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={wordObj.description}
                                                        onChange={(e) => updateWord(index, 'description', e.target.value)}
                                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter the description of the word (for TTS)"
                                                        maxLength={250}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={addWord}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            <Plus size={14} />
                                            Add Word
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mystery Box Content */}
                        {gameType === 'mystery-box' && (
                            <>
                                {/* Questions */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-black">
                                            Questions *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        >
                                            <Plus size={14} />
                                            Add Question
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                                                    {formData.questions.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeQuestion(qIndex)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter question"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options.map((option, oIndex) => (
                                                        <input
                                                            key={oIndex}
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                            placeholder={`Option ${oIndex + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.answer}
                                                    onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Correct answer"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rewards */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-black">
                                            Rewards
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addReward}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            <Plus size={14} />
                                            Add Reward
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.rewards.map((reward, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={reward}
                                                    onChange={(e) => updateReward(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder={`Reward ${index + 1}`}
                                                />
                                                {formData.rewards.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReward(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${gameType === 'word-search'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                        >
                            {isLoading ? 'Creating...' : 'Create Content'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
