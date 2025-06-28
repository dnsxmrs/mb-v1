'use server'

import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export interface CreateQuizItemData {
    storyId: number
    quizNumber: number
    question: string
    choices: string[]
    correctAnswer: string
}

export interface UpdateQuizItemData {
    question?: string
    choices?: string[]
    correctAnswer?: string
    quizNumber?: number
}

export interface CreateStoryWithQuizData {
    title: string
    description?: string
    fileLink: string
    subtitles?: string[]
    quizItems: Omit<CreateQuizItemData, 'storyId'>[]
}

// Get quiz items for a specific story
export async function getQuizItemsByStory(storyId: number) {
    try {
        const quizItems = await prisma.quizItem.findMany({
            where: {
                storyId,
                deletedAt: null
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
        const quizItem = await prisma.quizItem.create({
            data: {
                storyId: data.storyId,
                quizNumber: data.quizNumber,
                question: data.question,
                choices: data.choices,
                correctAnswer: data.correctAnswer
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
                    description: data.description || null,
                    fileLink: data.fileLink,
                    subtitles: data.subtitles || []
                }
            })

            // Create quiz items for the story
            const quizItems = await Promise.all(
                data.quizItems.map((quizItem) =>
                    tx.quizItem.create({
                        data: {
                            storyId: story.id,
                            quizNumber: quizItem.quizNumber,
                            question: quizItem.question,
                            choices: quizItem.choices,
                            correctAnswer: quizItem.correctAnswer
                        }
                    })
                )
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
        const quizItem = await prisma.quizItem.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...(data.question && { question: data.question }),
                ...(data.choices && { choices: data.choices }),
                ...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
                ...(data.quizNumber !== undefined && { quizNumber: data.quizNumber }),
                updatedAt: new Date()
            }
        })

        return { success: true, data: quizItem }
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
                quizItems.map((quizItem) =>
                    tx.quizItem.create({
                        data: {
                            storyId,
                            quizNumber: quizItem.quizNumber,
                            question: quizItem.question,
                            choices: quizItem.choices,
                            correctAnswer: quizItem.correctAnswer
                        }
                    })
                )
            )

            return newQuizItems
        })

        return { success: true, data: result }
    } catch (error) {
        console.error('Error updating story quiz items:', error)
        return { success: false, error: 'Failed to update story quiz items' }
    }
}
