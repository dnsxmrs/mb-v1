// src/actions/story-view.ts
'use server'

import { prisma } from '@/utils/prisma'
import { cookies } from 'next/headers'

export interface StudentStoryViewData {
    codeId: number
    storyId: number
    fullName: string
    section: string
}

/**
 * Track a student's story view. This function is non-blocking and will not throw errors
 * to avoid interrupting the user experience.
 */
export async function trackStoryView(code: string, fullName: string, section: string, deviceId: string) {
    try {

        if (!fullName || !section || !deviceId) {
            console.warn('Incomplete student info for story view tracking')
            return { success: false, error: 'Incomplete student information' }
        }

        // Get code and story information
        const codeRecord = await prisma.code.findUnique({
            where: {
                code: code.toUpperCase(),
                deletedAt: null
            },
            select: {
                id: true,
                storyId: true
            }
        })

        if (!codeRecord) {
            console.warn(`Invalid code for story view tracking: ${code}`)
            return { success: false, error: 'Invalid code' }
        }

        // Use upsert to handle the unique constraint gracefully
        await prisma.studentStoryView.upsert({
            where: {
                codeId_storyId_fullName_section_deviceId: {
                    codeId: codeRecord.id,
                    storyId: codeRecord.storyId,
                    fullName: fullName,
                    section: section,
                    deviceId: deviceId
                }
            },
            update: {
                // Update viewedAt to the current time if record exists
                viewedAt: new Date()
            },
            create: {
                codeId: codeRecord.id,
                storyId: codeRecord.storyId,
                fullName: fullName,
                section: section,
                deviceId: deviceId
            }
        })

        return { success: true }

    } catch (error) {
        // Log error but don't throw to avoid interrupting user experience
        console.error('Error tracking story view:', error)
        return { success: false, error: 'Failed to track story view' }
    }
}

/**
 * Get story view statistics for teachers/admins
 */
export async function getStoryViewStats(storyId?: number) {
    try {
        const where = storyId ? { storyId } : {}

        const viewStats = await prisma.studentStoryView.groupBy({
            by: ['storyId'],
            where,
            _count: {
                id: true
            }
        })

        const detailedViews = await prisma.studentStoryView.findMany({
            where,
            orderBy: {
                viewedAt: 'desc'
            }
        })

        return {
            success: true,
            data: {
                stats: viewStats,
                views: detailedViews
            }
        }

    } catch (error) {
        console.error('Error getting story view stats:', error)
        return { success: false, error: 'Failed to get story view statistics' }
    }
}

/**
 * Check if a student has viewed a specific story on the current device
 */
export async function hasStudentViewedStory(code: string, fullName: string, section: string, deviceId?: string) {
    try {
        const codeRecord = await prisma.code.findUnique({
            where: {
                code: code.toUpperCase(),
                deletedAt: null
            },
            select: {
                id: true,
                storyId: true
            }
        })

        if (!codeRecord) {
            return { success: false, error: 'Invalid code' }
        }

        // If no deviceId provided, search without deviceId constraint (backward compatibility)
        if (!deviceId) {
            const view = await prisma.studentStoryView.findFirst({
                where: {
                    codeId: codeRecord.id,
                    storyId: codeRecord.storyId,
                    fullName,
                    section
                }
            })

            return {
                success: true,
                data: {
                    hasViewed: !!view,
                    viewedAt: view?.viewedAt
                }
            }
        }

        const view = await prisma.studentStoryView.findUnique({
            where: {
                codeId_storyId_fullName_section_deviceId: {
                    codeId: codeRecord.id,
                    storyId: codeRecord.storyId,
                    fullName,
                    section,
                    deviceId
                }
            }
        })

        return {
            success: true,
            data: {
                hasViewed: !!view,
                viewedAt: view?.viewedAt
            }
        }

    } catch (error) {
        console.error('Error checking story view:', error)
        return { success: false, error: 'Failed to check story view' }
    }
}

/**
 * Get stories viewed by the current student on the current device (from session)
 */
export async function getStudentViewedStories() {
    try {
        // Get student info from cookies
        const cookieStore = await cookies()
        const studentInfoCookie = cookieStore.get("student_info")

        if (!studentInfoCookie) {
            return { success: false, error: 'No student session found' }
        }

        const studentInfo = JSON.parse(studentInfoCookie.value)
        const { name: fullName, section, deviceId } = studentInfo

        if (!fullName || !section || !deviceId) {
            return { success: false, error: 'Incomplete student information' }
        }

        // Get all stories viewed by this student on this specific device
        const viewedStories = await prisma.studentStoryView.findMany({
            where: {
                fullName,
                section,
                deviceId
            },
            include: {
                Story: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        author: true,
                        fileLink: true
                    }
                },
                Code: {
                    select: {
                        code: true
                    }
                }
            },
            orderBy: {
                viewedAt: 'desc'
            }
        })

        return {
            success: true,
            data: viewedStories.map(view => ({
                id: view.Story.id,
                title: view.Story.title,
                description: view.Story.description,
                author: view.Story.author,
                fileLink: view.Story.fileLink,
                viewedAt: view.viewedAt,
                code: view.Code.code
            }))
        }

    } catch (error) {
        console.error('Error getting student viewed stories:', error)
        return { success: false, error: 'Failed to get viewed stories' }
    }
}
