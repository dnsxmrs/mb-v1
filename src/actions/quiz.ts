// src/actions/quiz.ts
'use server'

import { prisma } from '@/utils/prisma'

export interface ChoiceData {
    id: number
    text: string
}

export interface CreateQuizItemData {
    storyId: number
    quizNumber: number
    question: string
    choices: ChoiceData[]
    correctAnswer: number // id of the correct choice
}

export interface UpdateQuizItemData {
    question?: string
    choices?: ChoiceData[]
    correctAnswer?: number
    quizNumber?: number
}

export interface CreateStoryWithQuizData {
    title: string
    author?: string
    description?: string
    fileLink: string
    subtitles?: string[]
    categoryId?: number
    quizItems: Omit<CreateQuizItemData, 'storyId'>[]
}

export interface QuizSubmissionData {
    codeId: number
    storyId: number
    fullName: string
    section: string
    answers: {
        quizItemId: number
        selectedAnswer: string // choice text that was selected
    }[]
}

export interface SubmissionResultData {
    submissionId: number
    score: number
    totalQuestions: number
    correctAnswers: number
    percentage: number
}

// Get quiz items for a specific story
export async function getQuizItemsByStory(storyId: number) {
    try {
        const quizItems = await prisma.quizItem.findMany({
            where: {
                storyId,
                deletedAt: null
            },
            include: {
                choices: true
            },
            orderBy: {
                quizNumber: 'asc'
            }
        })

        return { success: true, data: quizItems }
    } catch (error) {
        console.error('Error fetching quiz items:', error)
        return { success: false, error: 'Failed to fetch quiz items' }
    }
}

// Get a single quiz item
export async function getQuizItemById(id: number) {
    try {
        const quizItem = await prisma.quizItem.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                Story: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        if (!quizItem) {
            return { success: false, error: 'Quiz item not found' }
        }

        return { success: true, data: quizItem }
    } catch (error) {
        console.error('Error fetching quiz item:', error)
        return { success: false, error: 'Failed to fetch quiz item' }
    }
}

// Create a single quiz item
export async function createQuizItem(data: CreateQuizItemData) {
    try {
        // Find the correct answer text by the choice id
        const correctAnswerText = data.choices.find(choice => choice.id === data.correctAnswer)?.text || ''

        const quizItem = await prisma.quizItem.create({
            data: {
                storyId: data.storyId,
                quizNumber: data.quizNumber,
                question: data.question,
                correctAnswer: correctAnswerText,
                choices: {
                    create: data.choices.map(choice => ({
                        text: choice.text
                    }))
                }
            },
            include: {
                choices: true
            }
        })

        return { success: true, data: quizItem }
    } catch (error) {
        console.error('Error creating quiz item:', error)
        return { success: false, error: 'Failed to create quiz item' }
    }
}

// Create story with quiz items in a transaction
export async function createStoryWithQuiz(data: CreateStoryWithQuizData) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create the story first
            const story = await tx.story.create({
                data: {
                    title: data.title,
                    author: data.author || 'Anonymous',
                    description: data.description || null,
                    fileLink: data.fileLink,
                    subtitles: data.subtitles || [],
                    categoryId: data.categoryId || 0
                }
            })

            // Create quiz items for the story
            const quizItems = await Promise.all(
                data.quizItems.map((quizItem) => {
                    // Find the correct answer text by the choice id
                    const correctAnswerText = quizItem.choices.find(choice => choice.id === quizItem.correctAnswer)?.text || ''

                    return tx.quizItem.create({
                        data: {
                            storyId: story.id,
                            quizNumber: quizItem.quizNumber,
                            question: quizItem.question,
                            correctAnswer: correctAnswerText,
                            choices: {
                                create: quizItem.choices.map(choice => ({
                                    text: choice.text
                                }))
                            }
                        },
                        include: {
                            choices: true
                        }
                    })
                })
            )

            return { story, quizItems }
        })

        return { success: true, data: result }
    } catch (error) {
        console.error('Error creating story with quiz:', error)
        return { success: false, error: 'Failed to create story with quiz' }
    }
}

// Update a quiz item
export async function updateQuizItem(id: number, data: UpdateQuizItemData) {
    try {
        const updateData: {
            updatedAt: Date
            question?: string
            correctAnswer?: string
            quizNumber?: number
        } = {
            updatedAt: new Date()
        }

        if (data.question) {
            updateData.question = data.question
        }

        if (data.correctAnswer !== undefined) {
            if (data.choices) {
                updateData.correctAnswer = data.choices.find(choice => choice.id === data.correctAnswer)?.text || ''
            }
        }

        if (data.quizNumber !== undefined) {
            updateData.quizNumber = data.quizNumber
        }

        // Update the quiz item first
        await prisma.quizItem.update({
            where: {
                id,
                deletedAt: null
            },
            data: updateData
        })

        // Handle choices update separately if provided
        if (data.choices) {
            // Delete existing choices
            await prisma.choice.deleteMany({
                where: {
                    quizItemId: id
                }
            })

            // Create new choices
            await prisma.choice.createMany({
                data: data.choices.map(choice => ({
                    text: choice.text,
                    quizItemId: id
                }))
            })
        }

        // Return updated quiz item with choices
        const updatedQuizItem = await prisma.quizItem.findUnique({
            where: { id },
            include: { choices: true }
        })

        return { success: true, data: updatedQuizItem }
    } catch (error) {
        console.error('Error updating quiz item:', error)
        return { success: false, error: 'Failed to update quiz item' }
    }
}

// Delete a quiz item (soft delete)
export async function deleteQuizItem(id: number) {
    try {
        const quizItem = await prisma.quizItem.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date()
            }
        })

        return { success: true, data: quizItem }
    } catch (error) {
        console.error('Error deleting quiz item:', error)
        return { success: false, error: 'Failed to delete quiz item' }
    }
}

// Bulk update quiz items for a story
export async function updateStoryQuizItems(storyId: number, quizItems: CreateQuizItemData[]) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // First, soft delete all existing quiz items for this story
            await tx.quizItem.updateMany({
                where: {
                    storyId,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date(),
                    updatedAt: new Date()
                }
            })

            // Then create new quiz items
            const newQuizItems = await Promise.all(
                quizItems.map((quizItem) => {
                    // Find the correct answer text by the choice id
                    const correctAnswerText = quizItem.choices.find(choice => choice.id === quizItem.correctAnswer)?.text || ''

                    return tx.quizItem.create({
                        data: {
                            storyId,
                            quizNumber: quizItem.quizNumber,
                            question: quizItem.question,
                            correctAnswer: correctAnswerText,
                            choices: {
                                create: quizItem.choices.map(choice => ({
                                    text: choice.text
                                }))
                            }
                        },
                        include: {
                            choices: true
                        }
                    })
                })
            )

            return newQuizItems
        })

        return { success: true, data: result }
    } catch (error) {
        console.error('Error updating story quiz items:', error)
        return { success: false, error: 'Failed to update story quiz items' }
    }
}

// Submit quiz answers and calculate score
export async function submitQuizAnswers(data: QuizSubmissionData) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get the quiz items for this story to calculate score
            const quizItems = await tx.quizItem.findMany({
                where: {
                    storyId: data.storyId,
                    deletedAt: null
                },
                select: {
                    id: true,
                    correctAnswer: true
                }
            })

            if (quizItems.length === 0) {
                throw new Error('No quiz items found for this story')
            }

            // Create the submission record
            const submission = await tx.studentSubmission.create({
                data: {
                    codeId: data.codeId,
                    storyId: data.storyId,
                    fullName: data.fullName,
                    section: data.section,
                    score: null // Will be calculated after answers are saved
                }
            })

            // Create answer records and calculate score
            let correctCount = 0
            const totalQuestions = quizItems.length

            const answerPromises = data.answers.map(async (answer) => {
                const quizItem = quizItems.find(qi => qi.id === answer.quizItemId)
                if (!quizItem) {
                    throw new Error(`Quiz item ${answer.quizItemId} not found`)
                }

                // Check if the selected answer is correct
                const isCorrect = quizItem.correctAnswer === answer.selectedAnswer
                if (isCorrect) {
                    correctCount++
                }

                return tx.studentAnswer.create({
                    data: {
                        submissionId: submission.id,
                        quizItemId: answer.quizItemId,
                        selectedAnswer: answer.selectedAnswer
                    }
                })
            })

            await Promise.all(answerPromises)

            // Calculate score as number of correct answers
            const percentage = (correctCount / totalQuestions) * 100
            const score = correctCount // Store the number of correct answers as integer

            // Update submission with calculated score
            await tx.studentSubmission.update({
                where: { id: submission.id },
                data: { score }
            })

            return {
                submissionId: submission.id,
                score,
                totalQuestions,
                correctAnswers: correctCount,
                percentage
            }
        })

        return { success: true, data: result }
    } catch (error) {
        console.error('Error submitting quiz answers:', error)
        return { success: false, error: 'Failed to submit quiz answers' }
    }
}

// Get submission results by submission ID
export async function getSubmissionResults(submissionId: number) {
    try {
        const submission = await prisma.studentSubmission.findUnique({
            where: {
                id: submissionId,
                deletedAt: null
            },
            include: {
                Story: {
                    select: {
                        id: true,
                        title: true,
                        author: true
                    }
                },
                Answers: {
                    include: {
                        QuizItem: {
                            select: {
                                id: true,
                                question: true,
                                correctAnswer: true,
                                quizNumber: true
                            }
                        }
                    }
                }
            }
        })

        if (!submission) {
            return { success: false, error: 'Submission not found' }
        }

        const totalQuestions = submission.Answers.length
        const correctAnswers = submission.Answers.filter(
            answer => answer.selectedAnswer === answer.QuizItem.correctAnswer
        ).length

        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

        return {
            success: true,
            data: {
                submissionId: submission.id,
                story: submission.Story,
                fullName: submission.fullName,
                section: submission.section,
                score: submission.score || 0,
                totalQuestions,
                correctAnswers,
                percentage,
                submittedAt: submission.submittedAt,
                answers: submission.Answers.map(answer => ({
                    question: answer.QuizItem.question,
                    quizNumber: answer.QuizItem.quizNumber,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: answer.QuizItem.correctAnswer,
                    isCorrect: answer.selectedAnswer === answer.QuizItem.correctAnswer
                }))
            }
        }
    } catch (error) {
        console.error('Error getting submission results:', error)
        return { success: false, error: 'Failed to get submission results' }
    }
}

// Get submission results by code and student info (for accessing results without submission ID)
export async function getSubmissionResultsByCode(code: string, fullName: string, section: string) {
    try {
        const submission = await prisma.studentSubmission.findFirst({
            where: {
                fullName,
                section,
                deletedAt: null,
                Code: {
                    code,
                    deletedAt: null
                }
            },
            include: {
                Story: {
                    select: {
                        id: true,
                        title: true,
                        author: true
                    }
                },
                Answers: {
                    include: {
                        QuizItem: {
                            select: {
                                id: true,
                                question: true,
                                correctAnswer: true,
                                quizNumber: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        })

        if (!submission) {
            return { success: false, error: 'No submission found for this student' }
        }

        const totalQuestions = submission.Answers.length
        const correctAnswers = submission.Answers.filter(
            answer => answer.selectedAnswer === answer.QuizItem.correctAnswer
        ).length

        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

        return {
            success: true,
            data: {
                submissionId: submission.id,
                story: submission.Story,
                fullName: submission.fullName,
                section: submission.section,
                score: submission.score || 0,
                totalQuestions,
                correctAnswers,
                percentage,
                submittedAt: submission.submittedAt,
                answers: submission.Answers.map(answer => ({
                    question: answer.QuizItem.question,
                    quizNumber: answer.QuizItem.quizNumber,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: answer.QuizItem.correctAnswer,
                    isCorrect: answer.selectedAnswer === answer.QuizItem.correctAnswer
                }))
            }
        }
    } catch (error) {
        console.error('Error getting submission results by code:', error)
        return { success: false, error: 'Failed to get submission results' }
    }
}

// Check if a student has already taken the quiz for a specific code
export async function hasStudentTakenQuiz(code: string, fullName: string, section: string) {
    try {
        const submission = await prisma.studentSubmission.findFirst({
            where: {
                fullName,
                section,
                deletedAt: null,
                Code: {
                    code,
                    deletedAt: null
                }
            },
            select: {
                id: true,
                submittedAt: true
            }
        })

        return {
            success: true,
            data: {
                hasTaken: !!submission,
                submissionId: submission?.id || null,
                submittedAt: submission?.submittedAt || null
            }
        }
    } catch (error) {
        console.error('Error checking if student has taken quiz:', error)
        return { success: false, error: 'Failed to check quiz status' }
    }
}
