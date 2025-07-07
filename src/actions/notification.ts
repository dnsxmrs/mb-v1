'use server'

import { prisma } from '@/utils/prisma'
import { getCurrentUser } from './user'

export type NotificationType =
    | 'story_created'
    | 'story_updated'
    | 'story_deleted'
    | 'code_generated'
    | 'code_used'
    | 'quiz_completed'
    | 'user_created'
    | 'user_updated'
    | 'user_deleted'
    | 'category_created'
    | 'category_updated'
    | 'category_deleted'
    | 'system_config_updated'
    | 'submission_received'
    | 'quiz_created'
    | 'quiz_updated'

export interface CreateNotificationData {
    type: NotificationType
    message: string
    userId?: number
    metadata?: Record<string, unknown>
}

export interface Notification {
    id: number
    userId: number | null
    type: string
    message: string
    isRead: boolean
    createdAt: Date
    updatedAt: Date
}

/**
 * Create a new notification
 */
export async function createNotification(type: string, message: string): Promise<{
    success: boolean
    error?: string
}> {
    try {

        const user = await getCurrentUser()

        await prisma.notification.create({
            data: {
                userId: user?.data?.id || null,
                type,
                message,
                isRead: false
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error creating notification:', error)
        return { success: false, error: 'Failed to create notification' }
    }
}

/**
 * Get notifications for a specific user or all notifications if no userId provided
 */
export async function getNotifications(userId?: number, limit: number = 50): Promise<{
    success: boolean
    data?: Notification[]
    error?: string
}> {
    try {
        const notifications = await prisma.notification.findMany({
            where: userId ? { userId } : {},
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return { success: true, data: notifications }
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return { success: false, error: 'Failed to fetch notifications' }
    }
}
