'use client'

import { useState, useEffect } from 'react'
import { useSystemConfig } from '@/hooks/useSystemConfig'
import { updateSystemConfig, resetSystemConfig } from '@/actions/system-config'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/actions/category'
import toast from 'react-hot-toast'
import SubmitButton from '@/components/SubmitButton'
import Modal from '@/components/Modal'

interface Category {
    id: number
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: {
        Stories: number
    }
}

export default function SystemConfigPage() {
    const { config, loading, error, refetch } = useSystemConfig()
    const [isEditing, setIsEditing] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [formData, setFormData] = useState({
        defaultChoicesCount: 2,
        minChoicesCount: 2,
        maxChoicesCount: 10
    })

    // Category management state
    const [categories, setCategories] = useState<Category[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: ''
    })

    // Update form data when config loads
    useEffect(() => {
        if (config) {
            setFormData({
                defaultChoicesCount: config.defaultChoicesCount,
                minChoicesCount: config.minChoicesCount,
                maxChoicesCount: config.maxChoicesCount
            })
        }
    }, [config])

    // Load categories on component mount
    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setCategoriesLoading(true)
        try {
            const result = await getCategories()
            if (result.success) {
                setCategories(result.data || [])
            } else {
                toast.error(result.error || 'Failed to load categories')
            }
        } catch {
            toast.error('An unexpected error occurred while loading categories')
        } finally {
            setCategoriesLoading(false)
        }
    }

    const handleCreateCategory = () => {
        setCategoryFormData({ name: '', description: '' })
        setSelectedCategory(null)
        setShowCategoryModal(true)
    }

    const handleEditCategory = (category: Category) => {
        setCategoryFormData({
            name: category.name,
            description: category.description || ''
        })
        setSelectedCategory(category)
        setShowCategoryModal(true)
    }

    const handleDeleteCategory = (category: Category) => {
        setCategoryToDelete(category)
        setShowDeleteModal(true)
    }

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            let result
            if (selectedCategory) {
                // Update existing category
                result = await updateCategory(selectedCategory.id, {
                    name: categoryFormData.name,
                    description: categoryFormData.description || undefined
                })
            } else {
                // Create new category
                result = await createCategory({
                    name: categoryFormData.name,
                    description: categoryFormData.description || undefined
                })
            }

            if (result.success) {
                toast.success(selectedCategory ? 'Category updated successfully' : 'Category created successfully')
                setShowCategoryModal(false)
                setCategoryFormData({ name: '', description: '' })
                setSelectedCategory(null)
                loadCategories()
            } else {
                toast.error(result.error || 'Failed to save category')
            }
        } catch {
            toast.error('An unexpected error occurred while saving category')
        }
    }

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return

        try {
            const result = await deleteCategory(categoryToDelete.id)
            if (result.success) {
                toast.success('Category deleted successfully')
                setShowDeleteModal(false)
                setCategoryToDelete(null)
                loadCategories()
            } else {
                toast.error(result.error || 'Failed to delete category')
            }
        } catch {
            toast.error('An unexpected error occurred while deleting category')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await updateSystemConfig(formData)
            if (result.success) {
                toast.success('System configuration updated successfully')
                setIsEditing(false)
                refetch()
            } else {
                toast.error(result.error || 'Failed to update configuration')
            }
        } catch {
            toast.error('An error occurred while updating configuration')
        }
    }

    const handleReset = async () => {
        try {
            const result = await resetSystemConfig()
            if (result.success) {
                toast.success('System configuration reset to defaults')
                setIsEditing(false)
                setShowResetModal(false)
                refetch()
            } else {
                toast.error(result.error || 'Failed to reset configuration')
            }
        } catch {
            toast.error('An error occurred while resetting configuration')
        }
    }

    const handleEdit = () => {
        if (config) {
            setFormData({
                defaultChoicesCount: config.defaultChoicesCount,
                minChoicesCount: config.minChoicesCount,
                maxChoicesCount: config.maxChoicesCount
            })
        }
        setIsEditing(true)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-20 bg-gray-300 rounded"></div>
                        <div className="h-20 bg-gray-300 rounded"></div>
                        <div className="h-20 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Configuration</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Configure default settings for quiz creation</p>
                    </div>
                </div>

                {/* Quiz Choices Configuration Card */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Quiz Choices Configuration</h3>
                                <p className="mt-1 text-sm text-gray-500">Manage default settings for quiz question choices</p>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="hidden sm:inline">Edit Settings</span>
                                    <span className="sm:hidden">Edit</span>
                                </button>
                            )}
                        </div>

                        {!isEditing ? (
                            // Display current configuration
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                            Default Choices
                                        </h4>
                                        <p className="mt-2 text-2xl font-bold text-gray-900">
                                            {config?.defaultChoicesCount || 2}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Default number when adding questions
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                            Minimum Choices
                                        </h4>
                                        <p className="mt-2 text-2xl font-bold text-gray-900">
                                            {config?.minChoicesCount || 2}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Minimum required choices
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                            Maximum Choices
                                        </h4>
                                        <p className="mt-2 text-2xl font-bold text-gray-900">
                                            {config?.maxChoicesCount || 10}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Maximum allowed choices
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => setShowResetModal(true)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Reset to Defaults
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Edit form
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Default Choices
                                        </label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="26"
                                            value={formData.defaultChoicesCount}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                defaultChoicesCount: parseInt(e.target.value) || 2
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Auto-added when creating questions
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Required
                                        </label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="26"
                                            value={formData.minChoicesCount}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                minChoicesCount: parseInt(e.target.value) || 2
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Minimum choices per question
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Allowed
                                        </label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="26"
                                            value={formData.maxChoicesCount}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                maxChoicesCount: parseInt(e.target.value) || 10
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Max choices (limited to 26)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t">
                                    <SubmitButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                                        Save Changes
                                    </SubmitButton>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Category Management Card */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Category Management</h3>
                                <p className="mt-1 text-sm text-gray-500">Manage story categories for better organization</p>
                            </div>
                            <button
                                onClick={handleCreateCategory}
                                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add Category</span>
                            </button>
                        </div>

                        {categoriesLoading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-16 bg-gray-200 rounded"></div>
                                <div className="h-16 bg-gray-200 rounded"></div>
                                <div className="h-16 bg-gray-200 rounded"></div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-gray-500 text-sm">No categories found</p>
                                <p className="text-gray-400 text-xs">Create your first category to organize stories</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                                                    {category.description && (
                                                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                                                    )}
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {category._count.Stories} {category._count.Stories === 1 ? 'story' : 'stories'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditCategory(category)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                                title="Edit category"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category)}
                                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                title="Delete category"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => {
                    setShowCategoryModal(false)
                    setCategoryFormData({ name: '', description: '' })
                    setSelectedCategory(null)
                }}
                title={selectedCategory ? 'Edit Category' : 'Create New Category'}
            >
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({
                                ...categoryFormData,
                                name: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Enter category name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData({
                                ...categoryFormData,
                                description: e.target.value
                            })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Enter category description (optional)"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <SubmitButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                            {selectedCategory ? 'Update Category' : 'Create Category'}
                        </SubmitButton>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCategoryModal(false)
                                setCategoryFormData({ name: '', description: '' })
                                setSelectedCategory(null)
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Category Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setCategoryToDelete(null)
                }}
                title="Delete Category"
            >
                {categoryToDelete && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Warning: Category Deletion
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>This will permanently delete the category and:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>Remove it from all associated stories</li>
                                            <li>Cannot be undone</li>
                                        </ul>
                                        {categoryToDelete._count.Stories > 0 && (
                                            <p className="mt-2 text-yellow-600 font-medium">
                                                Note: This category has {categoryToDelete._count.Stories} associated {categoryToDelete._count.Stories === 1 ? 'story' : 'stories'}.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-700">
                            Are you sure you want to delete the category <strong>&quot;{categoryToDelete.name}&quot;</strong>?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setCategoryToDelete(null)
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteCategory}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete Category
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Reset Configuration
                                </h3>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to reset the configuration to defaults? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
