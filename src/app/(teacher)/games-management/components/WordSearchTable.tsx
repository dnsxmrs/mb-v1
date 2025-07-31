'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2, Eye, MoreVertical, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getWordSearches, updateWordSearchStatus, updateWordSearch, deleteWordSearch } from '@/actions/word-search'

interface WordSearchData {
    id: number
    title: string
    description: string | null
    status: string // Prisma returns string, not union type
    createdAt: Date | string // Can be Date from Prisma or string from mock data
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

export default function WordSearchTable() {
    const [data, setData] = useState<WordSearchData[]>([])
    const [showDropdown, setShowDropdown] = useState<number | null>(null)
    const [loadingToggle, setLoadingToggle] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [viewingItem, setViewingItem] = useState<WordSearchData | null>(null)
    const [editingItem, setEditingItem] = useState<WordSearchData | null>(null)
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        status: 'active' as 'active' | 'inactive',
        words: [] as { word: string; description?: string }[]
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result = await getWordSearches()
                if (result.success && result.data) {
                    setData(result.data)
                } else {
                    toast.error(result.error || 'Failed to fetch word searches')
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error('Failed to fetch word searches')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Handle escape key to close modals
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (editingItem) {
                    setEditingItem(null)
                } else if (viewingItem) {
                    setViewingItem(null)
                }
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [viewingItem, editingItem])

    const handleEdit = (id: number) => {
        const item = data.find(item => item.id === id)
        if (item) {
            setEditingItem(item)
            setEditForm({
                title: item.title,
                description: item.description || '',
                status: item.status as 'active' | 'inactive',
                words: item.items.map(wordItem => ({
                    word: wordItem.word,
                    description: wordItem.description || ''
                }))
            })
        }
        setShowDropdown(null)
    }

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const result = await deleteWordSearch(id)

                if (result.success) {
                    // Remove from local state
                    setData(data.filter(item => item.id !== id))
                    toast.success(result.message || 'Word search deleted successfully')
                } else {
                    toast.error(result.error || 'Failed to delete word search')
                }
            } catch (error) {
                console.error('Error deleting word search:', error)
                toast.error('Failed to delete word search. Please try again.')
            }
        }
        setShowDropdown(null)
    }

    const handleView = (id: number) => {
        const item = data.find(item => item.id === id)
        if (item) {
            setViewingItem(item)
        }
        setShowDropdown(null)
    }

    const handleToggleStatus = async (id: number) => {
        setLoadingToggle(id)

        try {
            // Find the item to get its current status and title before updating
            const item = data.find(item => item.id === id)
            if (!item) return

            const newStatus = item.status === 'active' ? 'inactive' : 'active'

            // Call the server action
            const result = await updateWordSearchStatus(id, newStatus)

            if (result.success) {
                // Update local state
                setData(prevData =>
                    prevData.map(item => {
                        if (item.id === id) {
                            return {
                                ...item,
                                status: newStatus,
                                updatedAt: new Date()
                            }
                        }
                        return item
                    })
                )

                // Show success toast
                toast.success(result.message || `Word search has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status. Please try again.')
        } finally {
            setLoadingToggle(null)
        }
    }

    const handleSaveEdit = async () => {
        if (!editingItem) return

        setIsSaving(true)
        try {
            // Here you would call your update API
            // For now, just simulate the update
            console.log('Saving edit:', editForm)

            const result = await updateWordSearch(editingItem.id, editForm)

            if (result.success) {
                // Refetch data to get updated information from server
                const updatedResult = await getWordSearches()
                if (updatedResult.success && updatedResult.data) {
                    setData(updatedResult.data)
                }
                toast.success(result.message || 'Word search updated successfully')
            } else {
                toast.error(result.error || 'Failed to update word search')
                return
            }
            setEditingItem(null)
        } catch (error) {
            console.error('Error updating word search:', error)
            toast.error('Failed to update word search. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="overflow-hidden">
            {/* Loading Skeleton */}
            {isLoading ? (
                <div className="p-4">
                    {/* Mobile Skeleton */}
                    <div className="block sm:hidden space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3 animate-pulse">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                                    <div className="h-6 bg-gray-300 rounded-full w-12"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Skeleton */}
                    <div className="hidden sm:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Words</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-gray-300 rounded w-48"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-9 bg-gray-300 rounded-full"></div>
                                                <div className="h-3 bg-gray-300 rounded w-12"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-3 bg-gray-300 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                                                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                                                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="block sm:hidden">
                        <div className="space-y-3 p-4">
                            {data.map((item) => (
                                <div key={item.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                            {item.description && (
                                                <p className="text-sm text-gray-500">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowDropdown(showDropdown === item.id ? null : item.id)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {showDropdown === item.id && (
                                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
                                                    <button
                                                        onClick={() => handleView(item.id)}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(item.id)}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {item.items.length} words
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${item.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => handleToggleStatus(item.id)}
                                                disabled={loadingToggle === item.id}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loadingToggle === item.id ? 'opacity-50 cursor-not-allowed' :
                                                    item.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                                {loadingToggle === item.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <p>Created: {new Date(item.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                        <p>Updated: {new Date(item.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Words
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Updated
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                {item.description || 'No description'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(item.id)}
                                                    className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loadingToggle === item.id ? 'opacity-50 cursor-not-allowed' :
                                                        item.status === 'inactive' ? 'opacity-50 bg-gray-300' :
                                                            item.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                                                            }`}
                                                    />
                                                    {loadingToggle === item.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                        </div>
                                                    )}
                                                </button>
                                                <span className={`text-xs font-medium ${item.status === 'active' ? 'text-green-700' :
                                                    item.status === 'inactive' ? 'text-red-700' : 'text-gray-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{item.items.length} words</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(item.updatedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(item.id)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {!isLoading && data.length === 0 && (
                        <div className="text-center py-12">
                            <Search className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No word search content</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating your first word search puzzle.</p>
                        </div>
                    )}
                </>
            )}

            {/* Minimalist View Modal */}
            {viewingItem && (
                <div
                    className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewingItem(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{viewingItem.title}</h2>
                                    {viewingItem.description && (
                                        <p className="text-gray-600 mt-2 text-justify">{viewingItem.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setViewingItem(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                >
                                    <X />
                                </button>
                            </div>

                            {/* Words List */}
                            <div className="space-y-3">
                                <table className="w-full">
                                    <tbody>
                                        {viewingItem.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="text-sm font-medium text-gray-900 pr-3 py-1 align-top">
                                                    {item.word}
                                                </td>
                                                <td className="text-gray-400 px-3 py-1 align-top">
                                                    -
                                                </td>
                                                <td className="text-sm text-gray-600 pl-3 py-1 align-top text-justify">
                                                    {item.description || 'No description'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div
                    className="fixed inset-0 text-black bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setEditingItem(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Word Search</h2>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault()
                                // Handle form submission
                                handleSaveEdit()
                            }}>
                                {/* Basic Information */}
                                <div className="space-y-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Words Section */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-black">Words</h3>
                                    </div>

                                    <div className="space-y-3 mb-2">
                                        {editForm.words.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-start">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Word"
                                                        value={item.word}
                                                        onChange={(e) => {
                                                            const newWords = [...editForm.words]
                                                            newWords[index].word = e.target.value
                                                            setEditForm({ ...editForm, words: newWords })
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Description"
                                                        value={item.description || ''}
                                                        onChange={(e) => {
                                                            const newWords = [...editForm.words]
                                                            newWords[index].description = e.target.value
                                                            setEditForm({ ...editForm, words: newWords })
                                                        }}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newWords = editForm.words.filter((_, i) => i !== index)
                                                        setEditForm({ ...editForm, words: newWords })
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    disabled={editForm.words.length === 1}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end">

                                        <button
                                            type="button"
                                            onClick={() => setEditForm({
                                                ...editForm,
                                                words: [...editForm.words, { word: '', description: '' }]
                                            })}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Add Word
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
