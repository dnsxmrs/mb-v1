// src/actions/story.ts
'use server'

import { prisma } from '@/utils/prisma'
import { createNotification } from './notification'

export interface CreateStoryData {
    title: string
    author?: string
    description?: string
    fileLink: string
    subtitles?: string[]
    categoryId?: number
}

export interface UpdateStoryData {
    title?: string
    author?: string
    description?: string
    fileLink?: string
    subtitles?: string[]
    categoryId?: number
}

export async function getStories() {
    try {
        const stories = await prisma.story.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                categoryId: true,
                title: true,
                author: true,
                description: true,
                fileLink: true,
                subtitles: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                _count: {
                    select: {
                        QuizItems: {
                            where: { deletedAt: null }
                        },
                        Codes: {
                            where: { deletedAt: null }
                        },
                        Submissions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { success: true, data: stories }
    } catch (error) {
        console.error('Error fetching stories:', error)
        return { success: false, error: 'Failed to fetch stories' }
    }
}

export async function getStoryById(id: number) {
    try {
        const story = await prisma.story.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                QuizItems: {
                    where: { deletedAt: null },
                    orderBy: { quizNumber: 'asc' }
                },
                Codes: {
                    where: { deletedAt: null },
                    include: {
                        Creator: {
                            select: {
                                first_name: true,
                                last_name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        Submissions: true
                    }
                }
            }
        })

        if (!story) {
            return { success: false, error: 'Story not found' }
        }

        return { success: true, data: story }
    } catch (error) {
        console.error('Error fetching story:', error)
        return { success: false, error: 'Failed to fetch story' }
    }
}

export async function createStory(data: CreateStoryData) {
    try {
        const story = await prisma.story.create({
            data: {
                title: data.title,
                author: data.author || 'Anonymous',
                description: data.description || null,
                fileLink: data.fileLink,
                subtitles: data.subtitles || [],
                categoryId: data.categoryId || 0
            }
        })

        await createNotification('story_created', `Nalikha ang kuwentong '${story.title}'`)

        return { success: true, data: story }
    } catch (error) {
        console.error('Error creating story:', error)
        return { success: false, error: 'Failed to create story' }
    }
}

export async function updateStory(id: number, data: UpdateStoryData) {
    try {
        const story = await prisma.story.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.author !== undefined && { author: data.author || 'Anonymous' }),
                ...(data.description !== undefined && { description: data.description || null }),
                ...(data.fileLink && { fileLink: data.fileLink }),
                ...(data.subtitles !== undefined && { subtitles: data.subtitles }),
                ...(data.categoryId !== undefined && { categoryId: data.categoryId || 0 }),
                updatedAt: new Date()
            }
        })

        await createNotification('story_updated', `Na-update ang kuwentong '${story.title}'`)

        return { success: true, data: story }
    } catch (error) {
        console.error('Error updating story:', error)
        return { success: false, error: 'Failed to update story' }
    }
}

export async function deleteStory(id: number) {
    try {
        // Soft delete - set deletedAt timestamp
        const story = await prisma.story.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date()
            }
        })

        await createNotification('story_deleted', `Na-delete ang kuwentong '${story.title}'`)

        return { success: true, data: story }
    } catch (error) {
        console.error('Error deleting story:', error)
        return { success: false, error: 'Failed to delete story' }
    }
}

export async function restoreStory(id: number) {
    try {
        const story = await prisma.story.update({
            where: {
                id
            },
            data: {
                deletedAt: null,
                updatedAt: new Date()
            }
        })

        return { success: true, data: story }
    } catch (error) {
        console.error('Error restoring story:', error)
        return { success: false, error: 'Failed to restore story' }
    }
}

// Get stories with quiz items for editing
export async function getStoriesWithQuiz() {
    try {
        const stories = await prisma.story.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                categoryId: true,
                title: true,
                author: true,
                description: true,
                fileLink: true,
                subtitles: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                QuizItems: {
                    where: { deletedAt: null },
                    orderBy: { quizNumber: 'asc' },
                    include: {
                        choices: true
                    }
                },
                _count: {
                    select: {
                        QuizItems: {
                            where: { deletedAt: null }
                        },
                        Codes: {
                            where: { deletedAt: null }
                        },
                        Submissions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { success: true, data: stories }
    } catch (error) {
        console.error('Error fetching stories with quiz:', error)
        return { success: false, error: 'Failed to fetch stories' }
    }
}
