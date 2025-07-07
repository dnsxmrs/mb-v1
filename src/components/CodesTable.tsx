'use client'

import { useState } from 'react'
import { Eye, Users, FileText, Calendar, ChevronRight, Search } from 'lucide-react'
import { CodeWithStoryData } from '@/actions/student-log'

interface CodesTableProps {
    codes: CodeWithStoryData[]
    onCodeClick: (codeId: number) => void
}

export default function CodesTable({ codes, onCodeClick }: CodesTableProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCodes = codes.filter(code =>
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.storyTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )

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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'inactive':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search codes or stories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-black w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                </div>
                <div className="text-sm text-gray-600">
                    {searchTerm ? `Showing results for "${searchTerm}"` : 'Showing all codes'}
                    {/* {filteredCodes.length} code{filteredCodes.length !== 1 ? 's' : ''} found */}
                </div>
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
                        {filteredCodes.map((code) => (
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
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                                        {code.status}
                                    </span>
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {filteredCodes.map((code) => (
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                                {code.status}
                            </span>
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
                ))}
            </div>

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
