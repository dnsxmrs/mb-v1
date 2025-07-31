'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
    getCodesWithStats,
    getCodeDetailsWithStudentData,
    getStudentSubmissionDetails,
    CodeWithStoryData,
    StudentSubmissionDetail
} from '@/actions/student-log'
import CodesTable from '@/components/CodesTable'
import StudentDetails from '@/components/StudentDetails'
import SubmissionDetail from '@/components/SubmissionDetail'
import { Loader2 } from 'lucide-react'

type ViewMode = 'codes' | 'students' | 'submission'

interface CodeDetailData {
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
    studentViews: {
        id: number
        fullName: string
        section: string
        viewedAt: Date
        hasSubmission: boolean
        score?: number
        submittedAt?: Date
    }[]
}

export default function StudentLogClient() {
    const [viewMode, setViewMode] = useState<ViewMode>('codes')
    const [loading, setLoading] = useState(true)
    const [codes, setCodes] = useState<CodeWithStoryData[]>([])
    const [selectedCodeData, setSelectedCodeData] = useState<CodeDetailData | null>(null)
    const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmissionDetail | null>(null)

    useEffect(() => {
        loadCodes()
    }, [])

    const loadCodes = async () => {
        setLoading(true)
        try {
            const result = await getCodesWithStats()
            if (result.success && result.data) {
                setCodes(result.data)
            } else {
                toast.error(result.error || 'Failed to load codes')
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleCodeClick = async (codeId: number) => {
        setLoading(true)
        try {
            const result = await getCodeDetailsWithStudentData(codeId)
            if (result.success && result.data) {
                setSelectedCodeData(result.data)
                setViewMode('students')
            } else {
                toast.error(result.error || 'Failed to load code details')
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleViewSubmission = async (codeId: number, fullName: string, section: string) => {
        setLoading(true)
        try {
            const result = await getStudentSubmissionDetails(codeId, fullName, section)
            if (result.success && result.data) {
                setSelectedSubmission(result.data)
                setViewMode('submission')
            } else {
                toast.error(result.error || 'Failed to load submission details')
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleBackToCodes = () => {
        setViewMode('codes')
        setSelectedCodeData(null)
        setSelectedSubmission(null)
    }

    const handleBackToStudents = () => {
        setViewMode('students')
        setSelectedSubmission(null)
    }

    if (loading && viewMode === 'codes') {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading student activity data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header - only show on codes view */}
            {viewMode === 'codes' && (
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Activity Log</h1>
                        <p className="text-gray-600">View story access codes and student submissions</p>
                    </div>
                </div>
            )}

            {/* Loading overlay for navigation */}
            {loading && viewMode !== 'codes' && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            )}

            {/* Content based on view mode */}
            {viewMode === 'codes' && (
                <CodesTable
                    codes={codes}
                    onCodeClick={handleCodeClick}
                />
            )}

            {viewMode === 'students' && selectedCodeData && (
                <StudentDetails
                    codeData={selectedCodeData}
                    onBack={handleBackToCodes}
                    onViewSubmission={handleViewSubmission}
                />
            )}

            {viewMode === 'submission' && selectedSubmission && (
                <SubmissionDetail
                    submission={selectedSubmission}
                    onBack={handleBackToStudents}
                />
            )}
        </div>
    )
}
