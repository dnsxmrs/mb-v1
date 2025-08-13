'use client'

import { useState } from 'react'
import {
    ArrowLeft,
    Eye,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    User,
    School,
    Award,
    BarChart3,
    Search
} from 'lucide-react'
import { StudentViewData } from '@/actions/student-log'

interface StudentDetailsProps {
    codeData: {
        code: {
            id: number
            code: string
            createdAt: Date
            status: string
            Story: {
                id: number
                title: string
                author: string
            }
        }
        studentViews: StudentViewData[]
    }
    onBack: () => void
    onViewSubmission: (codeId: number, fullName: string, section: string) => void
}

export default function StudentDetails({ codeData, onBack, onViewSubmission }: StudentDetailsProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'viewed' | 'submitted'>('all')

    const { code, studentViews } = codeData

    const filteredStudents = studentViews.filter(student => {
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.section.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'viewed' && !student.hasSubmission) ||
            (filterStatus === 'submitted' && student.hasSubmission)

        return matchesSearch && matchesFilter
    })

    const stats = {
        totalViews: studentViews.length,
        totalSubmissions: studentViews.filter(s => s.hasSubmission).length,
        averageScore: (() => {
            const submittedStudents = studentViews.filter(s => s.hasSubmission && s.score !== undefined)
            if (submittedStudents.length === 0) return 0

            // Calculate average percentage using actual total questions when available
            const totalPercentage = submittedStudents.reduce((sum, student) => {
                if (student.totalQuestions) {
                    // Use actual total questions
                    return sum + ((student.score || 0) / student.totalQuestions) * 100
                } else {
                    // Fallback: estimate total questions from maximum score
                    const maxScore = Math.max(...submittedStudents.map(s => s.score || 0))
                    const estimatedTotal = maxScore < 3 ? 10 : maxScore
                    return sum + ((student.score || 0) / estimatedTotal) * 100
                }
            }, 0)

            return Math.round(totalPercentage / submittedStudents.length)
        })(),
        submissionRate: studentViews.length > 0
            ? Math.round((studentViews.filter(s => s.hasSubmission).length / studentViews.length) * 100)
            : 0
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fil-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila',
        })
    }

    const getScoreBadgeColor = (student: StudentViewData) => {
        if (!student.hasSubmission || student.score === undefined) {
            return 'bg-gray-100 text-gray-800'
        }

        let percentage: number

        // Use actual total questions if available
        if (student.totalQuestions) {
            percentage = (student.score / student.totalQuestions) * 100
        } else {
            // Fallback: estimate from all submissions (old behavior)
            const submittedStudents = studentViews.filter(s => s.hasSubmission && s.score !== undefined)

            if (submittedStudents.length === 0) {
                // No submissions yet, treat score as percentage (fallback)
                percentage = student.score
            } else {
                // Estimate total questions from the maximum score
                let estimatedTotal = Math.max(...submittedStudents.map(s => s.score || 0))
                if (estimatedTotal < 3) {
                    estimatedTotal = 10 // reasonable default for quizzes
                }
                percentage = (student.score / estimatedTotal) * 100
            }
        }

        if (percentage >= 80) return 'bg-green-100 text-green-800'
        if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    const getScoreDisplay = (student: StudentViewData) => {
        if (!student.hasSubmission || student.score === undefined) {
            return '-'
        }

        // Use actual total questions if available, otherwise fallback to estimation
        if (student.totalQuestions) {
            return `${student.score}/${student.totalQuestions}`
        }

        // Fallback: estimate from all submissions (old behavior)
        const submittedStudents = studentViews.filter(s => s.hasSubmission && s.score !== undefined)
        if (submittedStudents.length === 0) {
            return `${student.score}%` // fallback to percentage
        }

        let estimatedTotal = Math.max(...submittedStudents.map(s => s.score || 0))
        if (estimatedTotal < 3) {
            estimatedTotal = 10
        }

        return `${student.score}/${estimatedTotal}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-black p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Bumalik</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Aktibidad ng Estudyante</h1>
                    <p className="text-gray-600">
                        Code: <span className="font-medium">{code.code}</span> - {code.Story.title}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Kabuuang View</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Mga Sagot</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Porsyento ng Pagsasagot</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.submissionRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Karaniwang Iskor</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Maghanap ng mga estudyante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-[#1E3A8A] w-full pl-9 pr-4 py-2 bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#3B82F6] border border-[#3B82F6] rounded-lg  focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#60A5FA]" size={16} />
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'viewed' | 'submitted')}
                        className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Lahat ng Estudyante</option>
                        <option value="viewed">Nakita Lamang</option>
                        <option value="submitted">Nag-submit na</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudyante
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nakita noong
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pagsasagot
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Iskor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksyon
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {student.section}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatDate(student.viewedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {student.hasSubmission ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm">
                                                {student.submittedAt ? formatDate(student.submittedAt) : 'Nag-submit na'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-600">
                                            <XCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm">Hindi pa nag-submit</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {student.hasSubmission && student.score !== undefined ? (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(student)}`}>
                                            {getScoreDisplay(student)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {student.hasSubmission ? (
                                        <button
                                            onClick={() => onViewSubmission(code.id, student.fullName, student.section)}
                                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                        >
                                            Tingnan ang Sagot
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Walang sagot</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {filteredStudents.map((student) => (
                    <div
                        key={student.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                    {student.fullName}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                    <School className="h-3 w-3 mr-1" />
                                    {student.section}
                                </div>
                            </div>
                            {student.hasSubmission && student.score !== undefined && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(student)}`}>
                                    {getScoreDisplay(student)}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm mb-3">
                            <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Nakita: {formatDate(student.viewedAt)}</span>
                            </div>
                            <div className="flex items-center">
                                {student.hasSubmission ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                        <span className="text-green-600">
                                            Nag-submit na: {student.submittedAt ? formatDate(student.submittedAt) : 'Oo'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                        <span className="text-red-600">Hindi pa nag-submit</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {student.hasSubmission && (
                            <button
                                onClick={() => onViewSubmission(code.id, student.fullName, student.section)}
                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md text-sm"
                            >
                                Tingnan ang Mga Detalye ng Sagot
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'Walang nakitang estudyante' : 'Wala pang aktibidad ng estudyante'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm
                            ? 'Subukan na baguhin ang inyong mga salitang hinahanap o mga filter'
                            : 'Makikita dito ang aktibidad ng estudyante kapag nag-access sila sa kuwentong ito'
                        }
                    </p>
                </div>
            )}
        </div>
    )
}
