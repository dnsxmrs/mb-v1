'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'
import LoadingLink from '@/components/LoadingLink'
import { hasStudentTakenQuiz } from '@/actions/quiz'

interface QuizButtonProps {
    code: string
    studentName: string
    studentSection: string
}

export default function QuizButton({ code, studentName, studentSection }: QuizButtonProps) {
    const [hasCompleted, setHasCompleted] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkQuizStatus = async () => {
            try {
                setLoading(true)
                const result = await hasStudentTakenQuiz(code, studentName, studentSection)

                if (result.success && result.data) {
                    setHasCompleted(result.data.hasTaken)
                } else {
                    console.error('Failed to check quiz status:', result.error)
                    // Default to showing the quiz button if there's an error
                    setHasCompleted(false)
                }
            } catch (error) {
                console.error('Error checking quiz status:', error)
                // Default to showing the quiz button if there's an error
                setHasCompleted(false)
            } finally {
                setLoading(false)
            }
        }

        checkQuizStatus()
    }, [code, studentName, studentSection])

    if (loading) {
        return (
            <div className="flex justify-end">
                <div className="rounded-xl">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-[#1E3A8A]">Checking quiz status...</h3>
                        <div className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-xl font-medium text-lg shadow-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Loading...
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (hasCompleted) {
        return (
            <div className="flex justify-end">
                <div className="rounded-xl">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-green-600">Quiz completed!</h3>
                        <LoadingLink
                            href={`/student/quiz/${code}/results`}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl font-medium text-lg shadow-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            View Results
                        </LoadingLink>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-end">
            <div className="rounded-xl">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-[#1E3A8A]">Ready for the quiz?</h3>
                    <LoadingLink
                        href={`/student/quiz/${code}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                        Take the Quiz <ArrowRight className="w-5 h-5 ml-2" />
                    </LoadingLink>
                </div>
            </div>
        </div>
    )
}
