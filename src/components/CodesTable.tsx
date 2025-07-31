'use client'

import { useState, useMemo, useCallback } from 'react'
import { Eye, Users, FileText, Calendar, ChevronRight, Search, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { CodeWithStoryData } from '@/actions/student-log'
import { updateCodeStatus } from '@/actions/code'

interface CodesTableProps {
    codes: CodeWithStoryData[]
    onCodeClick: (codeId: number) => void
}

export default function CodesTable({ codes, onCodeClick }: CodesTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [loadingToggles, setLoadingToggles] = useState<Set<number>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [codeStatuses, setCodeStatuses] = useState<Record<number, string>>(() => {
        // Initialize with current statuses from props
        const initialStatuses: Record<number, string> = {}
        codes.forEach(code => {
            initialStatuses[code.id] = code.status
        })
        return initialStatuses
    })

    // Helper function to get current status (either from local state or original props)
    const getCurrentStatus = useCallback((codeId: number) => {
        return codeStatuses[codeId] || codes.find(code => code.id === codeId)?.status || 'inactive'
    }, [codeStatuses, codes])

    // Memoized filtered codes to prevent unnecessary recalculations
    const filteredCodes = useMemo(() => {
        if (!searchTerm.trim()) return codes

        const lowerSearchTerm = searchTerm.toLowerCase()
        return codes.filter(code =>
            code.code.toLowerCase().includes(lowerSearchTerm) ||
            code.storyTitle.toLowerCase().includes(lowerSearchTerm)
        )
    }, [codes, searchTerm])

    // Pagination calculations
    const totalPages = Math.ceil(filteredCodes.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCodes = filteredCodes.slice(startIndex, endIndex)

    // Reset to first page when search changes
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }, [])

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila',
        })
    }

    const handleToggleStatus = useCallback(async (codeId: number, currentStatus: string) => {
        // Prevent multiple toggles on the same code
        if (loadingToggles.has(codeId)) {
            return
        }

        const newStatus = currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active'

        // Add to loading set
        setLoadingToggles(prev => new Set(prev).add(codeId))

        try {
            // Show loading toast
            const loadingToast = toast.loading(`${newStatus === 'active' ? 'Activating' : 'Deactivating'} code...`)


            // code.ts/updateCodeStatus
            const result = await updateCodeStatus(codeId, newStatus)

            toast.dismiss(loadingToast)

            if (result.success) {
                // Update local state immediately
                setCodeStatuses(prev => ({
                    ...prev,
                    [codeId]: newStatus
                }))

                toast.success(`Code ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, {
                    duration: 3000,
                    // icon: newStatus === 'active' ? '✅' : '❌'
                })
            } else {
                throw new Error('Failed to update code status')
            }
        } catch {
            toast.error(`Failed to ${newStatus === 'active' ? 'activate' : 'deactivate'} code. Please try again.`, {
                duration: 4000
            })
        } finally {
            // Remove from loading set
            setLoadingToggles(prev => {
                const newSet = new Set(prev)
                newSet.delete(codeId)
                return newSet
            })
        }
    }, [loadingToggles, setCodeStatuses])

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-start">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search codes or stories..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="text-black w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                </div>
                {searchTerm && (
                    <div className="text-sm text-gray-600">
                        Showing results for &ldquo;{searchTerm}&rdquo;
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code & Story
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Views
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Submissions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedCodes.map((code) => {
                            const currentStatus = getCurrentStatus(code.id)
                            return (
                                <tr key={code.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {code.code}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {code.storyTitle}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleToggleStatus(code.id, currentStatus)}
                                                disabled={loadingToggles.has(code.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${currentStatus.toLowerCase() === 'active'
                                                    ? 'bg-green-600'
                                                    : 'bg-gray-200'
                                                    }`}
                                                aria-label={`Toggle status from ${currentStatus} to ${currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active'}`}
                                                title={`Click to ${currentStatus.toLowerCase() === 'active' ? 'deactivate' : 'activate'} this code`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${loadingToggles.has(code.id)
                                                        ? 'animate-pulse'
                                                        : ''
                                                        } ${currentStatus.toLowerCase() === 'active'
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className={`ml-3 text-xs font-medium ${currentStatus.toLowerCase() === 'active'
                                                ? 'text-green-800'
                                                : 'text-gray-600'
                                                }`}>
                                                {loadingToggles.has(code.id) ? 'Loading...' : currentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(code.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            {code.viewCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-1" />
                                            {code.submissionCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onCodeClick(code.id)}
                                            className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center"
                                        >
                                            View Details
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {paginatedCodes.map((code) => {
                    const currentStatus = getCurrentStatus(code.id)
                    return (
                        <div
                            key={code.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900 font-mono">
                                        {code.code}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {code.storyTitle}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleToggleStatus(code.id, currentStatus)}
                                        disabled={loadingToggles.has(code.id)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${currentStatus.toLowerCase() === 'active'
                                            ? 'bg-green-600'
                                            : 'bg-gray-200'
                                            }`}
                                        aria-label={`Toggle status from ${currentStatus} to ${currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active'}`}
                                        title={`Click to ${currentStatus.toLowerCase() === 'active' ? 'deactivate' : 'activate'} this code`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${loadingToggles.has(code.id)
                                                ? 'animate-pulse'
                                                : ''
                                                } ${currentStatus.toLowerCase() === 'active'
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className={`ml-2 text-xs font-medium ${currentStatus.toLowerCase() === 'active'
                                        ? 'text-green-800'
                                        : 'text-gray-600'
                                        }`}>
                                        {loadingToggles.has(code.id) ? 'Loading...' : currentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600 mb-3">
                                <div>
                                    <Eye className="h-4 w-4 mx-auto mb-1" />
                                    <div className="font-medium">{code.viewCount}</div>
                                    <div className="text-xs">Views</div>
                                </div>
                                <div>
                                    <FileText className="h-4 w-4 mx-auto mb-1" />
                                    <div className="font-medium">{code.submissionCount}</div>
                                    <div className="text-xs">Submissions</div>
                                </div>
                                <div>
                                    <Calendar className="h-4 w-4 mx-auto mb-1" />
                                    <div className="font-medium text-xs">{formatDate(code.createdAt)}</div>
                                    <div className="text-xs">Created</div>
                                </div>
                            </div>

                            <button
                                onClick={() => onCodeClick(code.id)}
                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md text-sm inline-flex items-center justify-center"
                            >
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Pagination Controls */}
            {filteredCodes.length > itemsPerPage && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                            page === currentPage
                                                ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredCodes.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No codes found' : 'No codes available'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Codes will appear here when stories are shared with students'
                        }
                    </p>
                </div>
            )}
        </div>
    )
}
