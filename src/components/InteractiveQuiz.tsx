'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuizAnswers, type QuizSubmissionData } from '@/actions/quiz'
import { useStudentSessionRefresh } from '@/hooks/useStudentSession'
import toast from 'react-hot-toast'

interface Choice {
    id: number
    text: string
}

interface QuizItem {
    id: number
    quizNumber: number
    question: string
    correctAnswer: string
    choices: Choice[]
}

interface InteractiveQuizProps {
    quizItems: QuizItem[]
    code: string
    codeId: number
    storyId: number
    studentName: string
    studentSection: string
    studentDeviceId: string
}

export default function InteractiveQuiz({
    quizItems,
    code,
    codeId,
    storyId,
    studentName,
    studentSection,
    studentDeviceId
}: InteractiveQuizProps) {
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    // Add session refresh functionality
    const { refreshSession } = useStudentSessionRefresh();

    const handleAnswerChange = async (quizItemId: number, selectedChoiceText: string) => {
        setAnswers(prev => ({
            ...prev,
            [quizItemId]: selectedChoiceText
        }))
    }

    const handleSubmit = async () => {
        // Prevent multiple submissions
        if (isSubmitting) {
            return
        }

        // Check if all questions are answered
        const unansweredQuestions = quizItems.filter(quiz => !answers[quiz.id])

        if (unansweredQuestions.length > 0) {
            toast.error(`Paki-sagutan ang lahat ng tanong. ${unansweredQuestions.length} tanong ang natitira.`)
            return
        }

        // Refresh session before final submission to ensure validity
        try {
            await refreshSession();
        } catch (error) {
            console.warn('Session refresh failed, continuing with submission:', error);
        }

        setIsSubmitting(true)

        try {
            const submissionData: QuizSubmissionData = {
                codeId,
                storyId,
                fullName: studentName,
                section: studentSection,
                deviceId: studentDeviceId,
                answers: quizItems.map(quiz => ({
                    quizItemId: quiz.id,
                    selectedAnswer: answers[quiz.id]
                }))
            }

            const result = await submitQuizAnswers(submissionData)

            if (result.success) {
                toast.success('Matagumpay na naisumite ang pagsusulit!')
                // Redirect to results page
                router.push(`/student/quiz/${code}/results`)
            } else {
                // Handle specific error messages
                if (result.error?.includes('already been submitted')) {
                    toast.error('Naisumite na ang pagsusulit na ito.')
                    router.push(`/student/quiz/${code}/results`)
                } else {
                    toast.error(result.error || 'Nabigong isumite ang pagsusulit')
                }
            }
        } catch (error) {
            console.error('Error submitting quiz:', error)

            // Handle specific error types
            if (error instanceof Error) {
                if (error.message.includes('Transaction API error') || error.message.includes('P2028')) {
                    toast.error('Ang database ay abala. Pakisubukan ulit pagkatapos ng ilang sandali.')
                } else if (error.message.includes('already been submitted')) {
                    toast.error('Naisumite na ang pagsusulit na ito.')
                    router.push(`/student/quiz/${code}/results`)
                } else {
                    toast.error('Isang hindi inaasahang error ang naganap')
                }
            } else {
                toast.error('Isang hindi inaasahang error ang naganap')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const answeredCount = Object.keys(answers).length
    const totalQuestions = quizItems.length
    const allAnswered = answeredCount === totalQuestions

    return (
        <div className="space-y-8">
            {/* Progress indicator */}
            {/* <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-800">
                        Nasagutan na ang {answeredCount} sa {totalQuestions} tanong
                    </span>
                    <span className="text-sm text-blue-600">
                        {Math.round((answeredCount / totalQuestions) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    ></div>
                </div>
            </div> */}

            {/* Quiz Questions */}
            {quizItems.map((quiz) => (
                <div key={quiz.id} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">
                        {quiz.quizNumber}. {quiz.question}
                    </h3>

                    <div className="space-y-3">
                        {quiz.choices.map((choice, choiceIndex) => (
                            <label
                                key={choice.id}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${answers[quiz.id] === choice.text
                                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                                    : 'bg-white border-gray-200 hover:bg-blue-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${quiz.id}`}
                                    value={choice.text}
                                    checked={answers[quiz.id] === choice.text}
                                    onChange={(e) => handleAnswerChange(quiz.id, e.target.value)}
                                    className="mr-3 text-blue-600"
                                    disabled={isSubmitting}
                                />
                                <span className="text-gray-700">
                                    {String.fromCharCode(65 + choiceIndex)}. {choice.text}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Question status indicator */}
                    {/* {answers[quiz.id] && (
                        <div className="mt-3 flex items-center text-sm text-green-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Answered
                        </div>
                    )} */}
                </div>
            ))}

            {/* Submit Quiz Button */}
            <div className="flex flex-col items-center pt-6 space-y-4">
                {/* {!allAnswered && (
                    <p className="text-orange-600 text-sm font-medium">
                        Please answer all questions before submitting
                    </p>
                )} */}

                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className={`px-8 py-3 rounded-xl font-medium text-lg shadow-lg transition-all duration-200 transform ${allAnswered && !isSubmitting
                        ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Isinusumite ang pagsusulit...
                        </div>
                    ) : (
                        'Isumite ang Pagsusulit'
                    )}
                </button>
            </div>
        </div>
    )
}
