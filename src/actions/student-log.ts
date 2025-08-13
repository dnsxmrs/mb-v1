// src/actions/student-log.ts
'use server'

import { prisma } from '@/utils/prisma'

export interface CodeWithStoryData {
    id: number
    code: string
    createdAt: Date
    status: string
    storyId: number
    storyTitle: string
    viewCount: number
    submissionCount: number
}

export interface StudentViewData {
    id: number
    fullName: string
    section: string
    viewedAt: Date
    hasSubmission: boolean
    score?: number
    submittedAt?: Date
    totalQuestions?: number
}

export interface StudentSubmissionDetail {
    id: number
    fullName: string
    section: string
    submittedAt: Date
    score: number
    answers: {
        quizItemId: number
        question: string
        selectedAnswer: string
        correctAnswer: string
        isCorrect: boolean
    }[]
}

/**
 * Get all codes with their story information and statistics
 */
export async function getCodesWithStats() {
    try {
        const codes = await prisma.code.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                code: true,
                createdAt: true,
                status: true,
                storyId: true,
                Story: {
                    select: {
                        title: true
                    }
                },
                _count: {
                    select: {
                        StoryViews: true,
                        Submissions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const transformedCodes: CodeWithStoryData[] = codes.map(code => ({
            id: code.id,
            code: code.code,
            createdAt: code.createdAt,
            status: code.status,
            storyId: code.storyId,
            storyTitle: code.Story.title,
            viewCount: code._count.StoryViews,
            submissionCount: code._count.Submissions
        }))

        return {
            success: true,
            data: transformedCodes
        }
    } catch (error) {
        console.error('Error fetching codes with stats:', error)
        return {
            success: false,
            error: 'Failed to fetch codes'
        }
    }
}

/**
 * Get detailed view and submission data for a specific code
 */
export async function getCodeDetailsWithStudentData(codeId: number) {
    try {
        // Get code info
        const code = await prisma.code.findUnique({
            where: {
                id: codeId,
                deletedAt: null
            },
            select: {
                id: true,
                code: true,
                createdAt: true,
                status: true,
                Story: {
                    select: {
                        id: true,
                        title: true,
                        author: true
                    }
                }
            }
        })

        if (!code) {
            return {
                success: false,
                error: 'Code not found'
            }
        }

        // Get all story views for this code
        const storyViews = await prisma.studentStoryView.findMany({
            where: {
                codeId: codeId
            },
            select: {
                id: true,
                fullName: true,
                section: true,
                viewedAt: true
            },
            orderBy: {
                viewedAt: 'desc'
            }
        })

        // Get all submissions for this code
        const submissions = await prisma.studentSubmission.findMany({
            where: {
                codeId: codeId,
                deletedAt: null
            },
            select: {
                id: true,
                fullName: true,
                section: true,
                submittedAt: true,
                score: true,
                Answers: {
                    select: {
                        id: true
                    }
                }
            }
        })

        // Get total questions count for this story
        const totalQuestions = await prisma.quizItem.count({
            where: {
                storyId: code.Story.id,
                deletedAt: null
            }
        })

        // Create a map of submissions by student
        const submissionMap = new Map<string, { score: number; submittedAt: Date; totalQuestions: number }>()
        submissions.forEach(sub => {
            const key = `${sub.fullName}-${sub.section}`
            submissionMap.set(key, {
                score: sub.score || 0,
                submittedAt: sub.submittedAt,
                totalQuestions: sub.Answers.length // Use actual answered questions count
            })
        })

        // Combine views with submission data
        const studentViews: StudentViewData[] = storyViews.map(view => {
            const key = `${view.fullName}-${view.section}`
            const submission = submissionMap.get(key)

            return {
                id: view.id,
                fullName: view.fullName,
                section: view.section,
                viewedAt: view.viewedAt,
                hasSubmission: !!submission,
                score: submission?.score,
                submittedAt: submission?.submittedAt,
                totalQuestions: submission?.totalQuestions || totalQuestions
            }
        })

        return {
            success: true,
            data: {
                code: code,
                studentViews: studentViews
            }
        }
    } catch (error) {
        console.error('Error fetching code details:', error)
        return {
            success: false,
            error: 'Failed to fetch code details'
        }
    }
}

/**
 * Get detailed submission data for a specific student
 */
export async function getStudentSubmissionDetails(codeId: number, fullName: string, section: string) {
    try {
        const submission = await prisma.studentSubmission.findFirst({
            where: {
                codeId: codeId,
                fullName: fullName,
                section: section,
                deletedAt: null
            },
            select: {
                id: true,
                fullName: true,
                section: true,
                submittedAt: true,
                score: true,
                Answers: {
                    select: {
                        selectedAnswer: true,
                        QuizItem: {
                            select: {
                                id: true,
                                question: true,
                                correctAnswer: true
                            }
                        }
                    }
                }
            }
        })

        if (!submission) {
            return {
                success: false,
                error: 'Submission not found'
            }
        }

        const submissionDetail: StudentSubmissionDetail = {
            id: submission.id,
            fullName: submission.fullName,
            section: submission.section,
            submittedAt: submission.submittedAt,
            score: submission.score || 0,
            answers: submission.Answers.map(answer => ({
                quizItemId: answer.QuizItem.id,
                question: answer.QuizItem.question,
                selectedAnswer: answer.selectedAnswer,
                correctAnswer: answer.QuizItem.correctAnswer,
                isCorrect: answer.selectedAnswer === answer.QuizItem.correctAnswer
            }))
        }

        return {
            success: true,
            data: submissionDetail
        }
    } catch (error) {
        console.error('Error fetching submission details:', error)
        return {
            success: false,
            error: 'Failed to fetch submission details'
        }
    }
}
