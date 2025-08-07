'use server'

import { prisma } from '@/utils/prisma'
import { createNotification } from './notification'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/utils/cloudinary'

export interface MysteryBoxItem {
    id: number
    word: string
    description?: string | null
    imageUrl?: string | null
    status: 'active' | 'inactive'
}

export interface MysteryBoxData {
    status: 'active' | 'inactive'
    items: { word: string; description?: string; imageUrl?: string }[]
}

export async function getMysteryBoxItems() {
    try {
        const mysteryBoxItems = await prisma.mysteryBoxItem.findMany({
            where: {
                status: 'active',
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: mysteryBoxItems,
            message: 'Mystery box items fetched successfully'
        }
    } catch (error) {
        console.error('Error fetching mystery box items:', error)
        return {
            success: false,
            error: 'Failed to fetch mystery box items',
            data: []
        }
    }
}

export async function createMysteryBoxItems(data: MysteryBoxData) {
    try {
        // Process items and upload images to Cloudinary
        const processedItems = await Promise.all(
            data.items.map(async (item) => {
                let imageUrl = item.imageUrl

                // If imageUrl is a base64 data URL, upload to Cloudinary
                if (imageUrl && imageUrl.startsWith('data:image/')) {
                    const uploadResult = await uploadImageToCloudinary(imageUrl, 'mystery-box')

                    if (uploadResult.success && uploadResult.url) {
                        imageUrl = uploadResult.url
                    } else {
                        console.error('Failed to upload image to Cloudinary:', uploadResult.error)
                        // Continue without image if upload fails
                        imageUrl = undefined
                    }
                }

                return {
                    word: item.word,
                    description: item.description,
                    imageUrl: imageUrl,
                    status: data.status || 'active',
                }
            })
        )

        const mysteryBoxItems = await Promise.all(
            processedItems.map(async (item) => {
                return await prisma.mysteryBoxItem.create({
                    data: item
                })
            })
        )

        await createNotification('mystery_box_item_created', `Nagawa ang ${mysteryBoxItems.length} mystery box items`);

        return {
            success: true,
            data: mysteryBoxItems,
            message: 'Mystery box items created successfully'
        }
    } catch (error) {
        console.error('Error creating mystery box items:', error)
        return {
            success: false,
            error: 'Failed to create mystery box items'
        }
    }
}

export async function updateMysteryBoxItem(id: number, data: { word: string; description?: string; imageUrl?: string; status: 'active' | 'inactive' }) {
    try {
        // Get the current item to check existing image
        const currentItem = await prisma.mysteryBoxItem.findUnique({
            where: { id }
        })

        if (!currentItem) {
            return {
                success: false,
                error: 'Mystery box item not found'
            }
        }

        let processedImageUrl = data.imageUrl

        // If new imageUrl is a base64 data URL, upload to Cloudinary
        if (processedImageUrl && processedImageUrl.startsWith('data:image/')) {
            const uploadResult = await uploadImageToCloudinary(processedImageUrl, 'mystery-box')

            if (uploadResult.success && uploadResult.url) {
                processedImageUrl = uploadResult.url

                // Delete old image from Cloudinary if it exists and is a Cloudinary URL
                if (currentItem.imageUrl && currentItem.imageUrl.includes('cloudinary.com')) {
                    await deleteImageFromCloudinary(currentItem.imageUrl)
                }
            } else {
                console.error('Failed to upload image to Cloudinary:', uploadResult.error)
                return {
                    success: false,
                    error: 'Failed to upload image. Please try again.'
                }
            }
        }
        // If imageUrl is being cleared (empty string), delete old image from Cloudinary
        else if (processedImageUrl === '' && currentItem.imageUrl && currentItem.imageUrl.includes('cloudinary.com')) {
            await deleteImageFromCloudinary(currentItem.imageUrl)
            processedImageUrl = undefined
        }

        const updatedItem = await prisma.mysteryBoxItem.update({
            where: { id },
            data: {
                word: data.word,
                description: data.description,
                imageUrl: processedImageUrl,
                status: data.status,
                updatedAt: new Date()
            }
        })

        await createNotification('mystery_box_item_updated', `Na-update ang mystery box item '${data.word}'`);

        return {
            success: true,
            data: updatedItem,
            message: 'Mystery box item updated successfully'
        }
    } catch (error) {
        console.error('Error updating mystery box item:', error)
        return {
            success: false,
            error: 'Failed to update mystery box item'
        }
    }
}

export async function deleteMysteryBoxItem(id: number) {
    try {
        const item = await prisma.mysteryBoxItem.findUnique({
            where: { id }
        })

        if (!item) {
            return {
                success: false,
                error: 'Mystery box item not found'
            }
        }

        // Delete image from Cloudinary if it exists
        if (item.imageUrl && item.imageUrl.includes('cloudinary.com')) {
            await deleteImageFromCloudinary(item.imageUrl)
        }

        await prisma.mysteryBoxItem.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })

        await createNotification('mystery_box_item_deleted', `Na-delete ang mystery box item '${item.word}'`);

        return {
            success: true,
            message: 'Mystery box item deleted successfully'
        }
    } catch (error) {
        console.error('Error deleting mystery box item:', error)
        return {
            success: false,
            error: 'Failed to delete mystery box item'
        }
    }
}

export async function updateMysteryBoxItemStatus(id: number, status: 'active' | 'inactive') {
    try {
        const item = await prisma.mysteryBoxItem.findUnique({
            where: { id }
        })

        if (!item) {
            return {
                success: false,
                error: 'Mystery box item not found'
            }
        }

        const updatedItem = await prisma.mysteryBoxItem.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            }
        })

        await createNotification('mystery_box_item_status_updated', `Na-update ang status ng mystery box item '${item.word}' sa '${status}'`);

        return {
            success: true,
            data: updatedItem,
            message: `Na-update ang status ng mystery box item '${item.word}' sa '${status}'`
        }
    } catch (error) {
        console.error('Error updating mystery box item status:', error)
        return {
            success: false,
            error: 'Failed to update mystery box item status'
        }
    }
}

export async function createMysteryBoxItem(data: { word: string; description?: string; imageUrl?: string; status?: 'active' | 'inactive' }) {
    try {
        let processedImageUrl = data.imageUrl

        // If imageUrl is a base64 data URL, upload to Cloudinary
        if (processedImageUrl && processedImageUrl.startsWith('data:image/')) {
            const uploadResult = await uploadImageToCloudinary(processedImageUrl, 'mystery-box')

            if (uploadResult.success && uploadResult.url) {
                processedImageUrl = uploadResult.url
            } else {
                console.error('Failed to upload image to Cloudinary:', uploadResult.error)
                return {
                    success: false,
                    error: 'Failed to upload image. Please try again.'
                }
            }
        }

        const mysteryBoxItem = await prisma.mysteryBoxItem.create({
            data: {
                word: data.word,
                description: data.description,
                imageUrl: processedImageUrl,
                status: data.status || 'active',
            }
        })

        await createNotification('mystery_box_item_created', `Nagawa ang mystery box item '${data.word}'`);

        return {
            success: true,
            data: mysteryBoxItem,
            message: 'Mystery box item created successfully'
        }
    } catch (error) {
        console.error('Error creating mystery box item:', error)
        return {
            success: false,
            error: 'Failed to create mystery box item'
        }
    }
}

export async function getAllMysteryBoxItems() {
    try {
        const mysteryBoxItems = await prisma.mysteryBoxItem.findMany({
            where: {
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: mysteryBoxItems,
            message: 'All mystery box items fetched successfully'
        }
    } catch (error) {
        console.error('Error fetching all mystery box items:', error)
        return {
            success: false,
            error: 'Failed to fetch mystery box items',
            data: []
        }
    }
}
