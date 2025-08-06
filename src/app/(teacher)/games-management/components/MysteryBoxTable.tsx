'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2, Eye, Gift, X } from 'lucide-react'
import { getAllMysteryBoxItems, updateMysteryBoxItem, deleteMysteryBoxItem, updateMysteryBoxItemStatus } from '@/actions/mystery-box'
import ImageUploadCrop from '@/components/ImageUploadCrop'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface MysteryBoxItem {
    id: number
    word: string
    description?: string | null
    imageUrl?: string | null
    status: string
    createdAt: Date | string // Can be Date from Prisma or string from mock data
    updatedAt: Date | string
    deletedAt: Date | string | null
}

export default function MysteryBoxTable() {
    const [data, setData] = useState<MysteryBoxItem[]>([])
    const [loadingToggle, setLoadingToggle] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [viewingItem, setViewingItem] = useState<MysteryBoxItem | null>(null)
    const [editingItem, setEditingItem] = useState<MysteryBoxItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<MysteryBoxItem | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        word: '',
        description: '',
        imageUrl: '',
        status: 'active' as 'active' | 'inactive'
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const result = await getAllMysteryBoxItems()
            if (result.success && result.data) {
                setData(result.data)
            } else {
                toast.error(result.error || 'Failed to fetch mystery box items')
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to fetch mystery box items')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Handle escape key to close modals
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (deletingItem) {
                    setDeletingItem(null)
                } else if (editingItem) {
                    setEditingItem(null)
                } else if (viewingItem) {
                    setViewingItem(null)
                }
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [viewingItem, editingItem, deletingItem])


    const handleEdit = (id: number) => {
        const item = data.find(item => item.id === id)
        if (item) {
            setEditingItem(item)
            setEditForm({
                word: item.word,
                description: item.description || '',
                imageUrl: item.imageUrl || '',
                status: item.status as 'active' | 'inactive'
            })
        }
    }

    const handleDelete = (id: number) => {
        const item = data.find(item => item.id === id)
        if (item) {
            setDeletingItem(item)
        }
    }

    const confirmDelete = async (item: MysteryBoxItem) => {
        setIsDeleting(true)
        try {
            const result = await deleteMysteryBoxItem(item.id)

            if (result.success) {
                // Remove from local state
                setData(data.filter(dataItem => dataItem.id !== item.id))
                toast.success(result.message || 'Mystery box item deleted successfully')
            } else {
                toast.error(result.error || 'Failed to delete mystery box item')
            }
        } catch (error) {
            console.error('Error deleting mystery box item:', error)
            toast.error('Failed to delete mystery box item. Please try again.')
        } finally {
            setIsDeleting(false)
            setDeletingItem(null)
        }
    }

    const handleView = (id: number) => {
        const item = data.find(item => item.id === id)
        if (item) {
            setViewingItem(item)
        }
    }

    const handleToggleStatus = async (id: number) => {
        setLoadingToggle(id)

        try {
            // Find the item to get its current status before updating
            const item = data.find(item => item.id === id)
            if (!item) return

            const newStatus = item.status === 'active' ? 'inactive' : 'active'

            // Call the server action
            const result = await updateMysteryBoxItemStatus(id, newStatus)

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
                toast.success(result.message || `${item.word} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
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
            const result = await updateMysteryBoxItem(editingItem.id, editForm)

            if (result.success) {
                // Update local state immediately with the edited data
                setData(prevData =>
                    prevData.map(item => {
                        if (item.id === editingItem.id) {
                            return {
                                ...item,
                                word: editForm.word,
                                description: editForm.description,
                                imageUrl: editForm.imageUrl,
                                status: editForm.status,
                                updatedAt: new Date()
                            }
                        }
                        return item
                    })
                )
                toast.success(result.message || 'Mystery box item updated successfully')
                setEditingItem(null)
            } else {
                toast.error(result.error || 'Failed to update mystery box item')
            }
        } catch (error) {
            console.error('Error updating mystery box item:', error)
            toast.error('Failed to update mystery box item. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="overflow-hidden">
            {/* Loading Skeleton */}
            {isLoading ? (
                <div className="">
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
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word & Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
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
                                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-9 bg-gray-300 rounded-full"></div>
                                                <div className="h-3 bg-gray-300 rounded w-12"></div>
                                            </div>
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
                        <div className="space-y-3">
                            {data.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                    {/* Card Content */}
                                    <div className="p-4 space-y-3">
                                        {/* Title and Status */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">{item.word}</h3>
                                            <div className="flex items-center gap-2">
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

                                        {/* Description */}
                                        {item.description && (
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        )}

                                        {/* Status and Image Info */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Image: {item.imageUrl ? 'Available' : 'Not set'}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Date Created */}
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                timeZone: "Asia/Manila",
                                            })}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="border-t border-gray-200 px-4 py-3">
                                        <div className="flex justify-between gap-2">
                                            <button
                                                onClick={() => handleView(item.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Word & Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
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
                                            <div className="text-sm font-medium text-gray-900">{item.word}</div>
                                            <div className="text-sm text-gray-500">{item.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {item.imageUrl ? 'Available' : 'Not set'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
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
                                                <span className={`text-xs font-medium ${item.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    timeZone: "Asia/Manila",
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(item.id)}
                                                    className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
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
                            <Gift className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No mystery box content</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating your first mystery box puzzle.</p>
                        </div>
                    )}

                    {/* View Modal */}
                    {viewingItem && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
                                            <h2 className="text-2xl font-bold text-gray-900">{viewingItem.word}</h2>
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

                                    {/* Image Display */}
                                    <div className="space-y-3">
                                        {viewingItem.imageUrl ? (
                                            <div className="flex justify-center">
                                                <Image
                                                    src={viewingItem.imageUrl}
                                                    alt={viewingItem.word}
                                                    width={300}
                                                    height={200}
                                                    className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Gift size={48} className="mx-auto mb-2 text-gray-300" />
                                                <p>No image available</p>
                                            </div>
                                        )}

                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Status:</span>
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${viewingItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {viewingItem.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Created:</span>
                                                    <span className="ml-2 text-gray-700">
                                                        {new Date(viewingItem.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            timeZone: "Asia/Manila",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editingItem && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setEditingItem(null)}
                        >
                            <div
                                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-black">Edit Mystery Box Item</h2>
                                    </div>

                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        handleSaveEdit()
                                    }}>
                                        {/* Basic Information */}
                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-2">
                                                    Word <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.word}
                                                    onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black mb-2">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    rows={3}
                                                    placeholder="Enter a description for this word..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black mb-2">
                                                    Image
                                                </label>
                                                <ImageUploadCrop
                                                    value={editForm.imageUrl}
                                                    onChange={(imageDataUrl) => setEditForm({ ...editForm, imageUrl: imageDataUrl })}
                                                    onRemove={() => setEditForm({ ...editForm, imageUrl: '' })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-black mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}
                                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
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

                    {/* Delete Confirmation Modal */}
                    {deletingItem && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setDeletingItem(null)}
                        >
                            <div
                                className="bg-white rounded-lg max-w-md w-full p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Mystery Box Item</h3>
                                    <button
                                        onClick={() => setDeletingItem(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        Are you sure you want to delete &ldquo;<strong>{deletingItem.word}</strong>&rdquo;?
                                    </p>
                                    <p className="text-red-600 text-sm">
                                        This action cannot be undone. The mystery box item and its associated image will be permanently deleted.
                                    </p>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setDeletingItem(null)}
                                            disabled={isDeleting}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(deletingItem)}
                                            disabled={isDeleting}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                'Delete Item'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
