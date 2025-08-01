'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { createWordSearch, type WordSearchData } from '@/actions/word-search'
import { createMysteryBoxItems, type MysteryBoxData } from '@/actions/mystery-box'
import ImageUploadCrop from '@/components/ImageUploadCrop'
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
        items: [{ word: '', description: '', imageUrl: '' }],
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
            // Handle mystery box submission
            setIsLoading(true)

            try {
                const mysteryBoxData: MysteryBoxData = {
                    status: formData.status as 'active' | 'inactive',
                    items: formData.items.filter(item => item.word.trim() !== '')
                }

                const result = await createMysteryBoxItems(mysteryBoxData)

                if (result.success) {
                    toast.success(result.message || 'Mystery box items created successfully!')
                    onSuccess?.()
                } else {
                    toast.error(result.error || 'Failed to create mystery box items')
                }
            } catch (error) {
                console.error('Error submitting form:', error)
                toast.error('An unexpected error occurred')
            } finally {
                setIsLoading(false)
            }
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

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { word: '', description: '', imageUrl: '' }]
        }))
    }

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const updateItem = (index: number, field: 'word' | 'description' | 'imageUrl', value: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
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
                        {/* Basic Info - Only for Word Search */}
                        {gameType === 'word-search' && (
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
                        )}

                        {/* Status field for Mystery Box */}
                        {gameType === 'mystery-box' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                                        className="cursor-not-allowed text-gray-500 bg-gray-300 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="active">Active (default)</option>
                                    </select>
                                </div>
                            </div>
                        )}

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
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-black">
                                        Items <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-black">Item {index + 1}</h4>
                                                {formData.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
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
                                                        value={item.word}
                                                        onChange={(e) => updateItem(index, 'word', e.target.value)}
                                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        placeholder="Enter the description"
                                                        maxLength={250}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black mb-1">
                                                    Image
                                                </label>
                                                <ImageUploadCrop
                                                    value={item.imageUrl}
                                                    onChange={(imageDataUrl) => updateItem(index, 'imageUrl', imageDataUrl)}
                                                    onRemove={() => updateItem(index, 'imageUrl', '')}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="flex items-center  gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        >
                                            <Plus size={14} />
                                            Add Item
                                        </button>
                                    </div>
                                </div>
                            </div>
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
