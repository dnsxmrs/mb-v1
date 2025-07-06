'use client'

import { useState } from 'react'
import { useSystemConfig } from '@/hooks/useSystemConfig'
import { updateSystemConfig, resetSystemConfig } from '@/actions/system-config'
import toast from 'react-hot-toast'
import SubmitButton from '@/components/SubmitButton'

export default function SystemConfigPage() {
    const { config, loading, error, refetch } = useSystemConfig()
    const [isEditing, setIsEditing] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [formData, setFormData] = useState({
        defaultChoicesCount: 2,
        minChoicesCount: 2,
        maxChoicesCount: 10
    })

    // Update form data when config loads
    useState(() => {
        if (config) {
            setFormData({
                defaultChoicesCount: config.defaultChoicesCount,
                minChoicesCount: config.minChoicesCount,
                maxChoicesCount: config.maxChoicesCount
            })
        }
    })

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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
                        <p className="text-gray-600 mt-2">
                            Configure default settings for quiz creation
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Edit Settings
                        </button>
                    )}
                </div>

                {!isEditing ? (
                    // Display current configuration
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Default Choices
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {config?.defaultChoicesCount || 2}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Default number of choices when adding new questions
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Minimum Choices
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {config?.minChoicesCount || 2}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Minimum required choices per question
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Maximum Choices
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {config?.maxChoicesCount || 10}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Maximum allowed choices per question
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <button
                                onClick={() => setShowResetModal(true)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                ) : (
                    // Edit form
                    <form onSubmit={handleSubmit} className="space-y-6 text-black">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Number of Choices
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Number of choices automatically added when creating new questions
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Choices Required
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Minimum number of choices required for each question
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Choices Allowed
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Maximum number of choices allowed per question (limited to 26 for A-Z labeling)
                            </p>
                        </div>

                        <div className="flex gap-4 pt-6">
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

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
