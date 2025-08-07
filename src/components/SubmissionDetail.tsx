'use client'

import { ArrowLeft, CheckCircle, XCircle, Clock, User, School, Award } from 'lucide-react'
import { StudentSubmissionDetail } from '@/actions/student-log'

interface SubmissionDetailProps {
    submission: StudentSubmissionDetail
    onBack: () => void
}

export default function SubmissionDetail({ submission, onBack }: SubmissionDetailProps) {
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

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBadgeColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800'
        if (score >= 60) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    const correctAnswers = submission.answers.filter(answer => answer.isCorrect).length
    const totalQuestions = submission.answers.length
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-black p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Bumalik</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Mga Detalye ng Sagot</h1>
                    <p className="text-sm text-gray-600">
                        {submission.fullName} - {submission.section}
                    </p>
                </div>
            </div>

            {/* Student Info Card - 2x2 Layout */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Estudyante</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{submission.fullName}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <School className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Seksyon</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{submission.section}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Iskor</p>
                            <p className={`text-sm font-medium ${getScoreColor(percentage)}`}>
                                {correctAnswers}/{totalQuestions} ({percentage}%)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600">Nag-submit noong</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(submission.submittedAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Inline Score Summary with Performance Bar */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 text-xs">
                            <span className="text-green-600 font-medium">{correctAnswers} Tama</span>
                            <span className="text-red-600 font-medium">{totalQuestions - correctAnswers} Mali</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(percentage)}`}>
                            {percentage >= 80 ? 'Napakagaling' : percentage >= 60 ? 'Mabuti' : 'Kailangan pa ng Pagpapabuti'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Detailed Answers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-base font-medium text-gray-900 mb-3">Mga Sagot sa Quiz</h2>
                <div className="space-y-2">
                    {submission.answers.map((answer, index) => (
                        <div key={answer.quizItemId} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {index + 1}
                                </h3>
                                {answer.isCorrect ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                            </div>

                            <p className="text-sm text-gray-800 mb-2">{answer.question}</p>

                            <div className="space-y-1.5">
                                <div className={`p-2 rounded text-xs ${answer.isCorrect
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                    }`}>
                                    <span className="font-medium text-gray-600">Sagot: </span>
                                    <span className={answer.isCorrect ? 'text-green-800' : 'text-red-800'}>
                                        {answer.selectedAnswer}
                                    </span>
                                </div>

                                {!answer.isCorrect && (
                                    <div className="p-2 rounded text-xs bg-green-50 border border-green-200">
                                        <span className="font-medium text-gray-600">Tamang Sagot: </span>
                                        <span className="text-green-800">{answer.correctAnswer}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
