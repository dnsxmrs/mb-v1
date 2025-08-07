// src/actions/system-config.ts
'use server'

import { prisma } from '@/utils/prisma'
import { createNotification } from './notification'

export interface SystemConfigData {
    defaultChoicesCount: number
    maxChoicesCount: number
    minChoicesCount: number
}

export interface UpdateSystemConfigData {
    defaultChoicesCount?: number
    maxChoicesCount?: number
    minChoicesCount?: number
}

// Get system configuration (creates default if doesn't exist)
export async function getSystemConfig() {
    try {
        let config = await prisma.systemConfig.findFirst()

        // Create default config if none exists
        if (!config) {
            config = await prisma.systemConfig.create({
                data: {
                    defaultChoicesCount: 2,
                    maxChoicesCount: 10,
                    minChoicesCount: 2
                }
            })
        }

        return { success: true, data: config }
    } catch (error) {
        console.error('Error fetching system config:', error)
        return { success: false, error: 'Failed to fetch system configuration' }
    }
}

// Update system configuration
export async function updateSystemConfig(data: UpdateSystemConfigData) {
    try {
        // Validate the data
        if (data.minChoicesCount && data.minChoicesCount < 2) {
            return { success: false, error: 'Minimum choices count cannot be less than 2' }
        }

        if (data.maxChoicesCount && data.maxChoicesCount > 26) {
            return { success: false, error: 'Maximum choices count cannot exceed 26 (A-Z)' }
        }

        if (data.minChoicesCount && data.maxChoicesCount && data.minChoicesCount > data.maxChoicesCount) {
            return { success: false, error: 'Minimum choices count cannot be greater than maximum choices count' }
        }

        if (data.defaultChoicesCount && data.minChoicesCount && data.defaultChoicesCount < data.minChoicesCount) {
            return { success: false, error: 'Default choices count cannot be less than minimum choices count' }
        }

        if (data.defaultChoicesCount && data.maxChoicesCount && data.defaultChoicesCount > data.maxChoicesCount) {
            return { success: false, error: 'Default choices count cannot be greater than maximum choices count' }
        }

        // Get existing config or create one
        let config = await prisma.systemConfig.findFirst()

        if (!config) {
            // Create new config with provided data
            config = await prisma.systemConfig.create({
                data: {
                    defaultChoicesCount: data.defaultChoicesCount || 2,
                    maxChoicesCount: data.maxChoicesCount || 10,
                    minChoicesCount: data.minChoicesCount || 2
                }
            })
        } else {
            // Update existing config
            config = await prisma.systemConfig.update({
                where: { id: config.id },
                data: {
                    ...(data.defaultChoicesCount !== undefined && { defaultChoicesCount: data.defaultChoicesCount }),
                    ...(data.maxChoicesCount !== undefined && { maxChoicesCount: data.maxChoicesCount }),
                    ...(data.minChoicesCount !== undefined && { minChoicesCount: data.minChoicesCount }),
                    updatedAt: new Date()
                }
            })
        }

        await createNotification('system_config_updated', `Na-update ang system configuration`)

        return { success: true, data: config }
    } catch (error) {
        console.error('Error updating system config:', error)
        return { success: false, error: 'Failed to update system configuration' }
    }
}

// Reset system configuration to defaults
export async function resetSystemConfig() {
    try {
        let config = await prisma.systemConfig.findFirst()

        if (!config) {
            config = await prisma.systemConfig.create({
                data: {
                    defaultChoicesCount: 2,
                    maxChoicesCount: 10,
                    minChoicesCount: 2
                }
            })
        } else {
            config = await prisma.systemConfig.update({
                where: { id: config.id },
                data: {
                    defaultChoicesCount: 2,
                    maxChoicesCount: 10,
                    minChoicesCount: 2,
                    updatedAt: new Date()
                }
            })
        }

        await createNotification('system_config_reset', `Na-reset ang system configuration sa mga default na halaga`)

        return { success: true, data: config }
    } catch (error) {
        console.error('Error resetting system config:', error)
        return { success: false, error: 'Failed to reset system configuration' }
    }
}
