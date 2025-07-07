'use server'

import { prisma } from '@/utils/prisma'

export interface CreateCategoryData {
    name: string
    description?: string
}

export interface UpdateCategoryData {
    name?: string
    description?: string
}

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        Stories: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, data: categories }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { success: false, error: 'Failed to fetch categories' }
    }
}

export async function getCategoryById(id: number) {
    try {
        const category = await prisma.category.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                Stories: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        title: true,
                        author: true
                    }
                },
                _count: {
                    select: {
                        Stories: true
                    }
                }
            }
        })

        if (!category) {
            return { success: false, error: 'Category not found' }
        }

        return { success: true, data: category }
    } catch (error) {
        console.error('Error fetching category:', error)
        return { success: false, error: 'Failed to fetch category' }
    }
}

export async function createCategory(data: CreateCategoryData) {
    try {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description || null
            }
        })

        return { success: true, data: category }
    } catch (error) {
        console.error('Error creating category:', error)
        return { success: false, error: 'Failed to create category' }
    }
}

export async function updateCategory(id: number, data: UpdateCategoryData) {
    try {
        const category = await prisma.category.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description || null }),
                updatedAt: new Date()
            }
        })

        return { success: true, data: category }
    } catch (error) {
        console.error('Error updating category:', error)
        return { success: false, error: 'Failed to update category' }
    }
}

export async function deleteCategory(id: number) {
    try {
        // Check if category has stories
        const categoryWithStories = await prisma.category.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                _count: {
                    select: {
                        Stories: {
                            where: { deletedAt: null }
                        }
                    }
                }
            }
        })

        if (!categoryWithStories) {
            return { success: false, error: 'Category not found' }
        }

        if (categoryWithStories._count.Stories > 0) {
            return { success: false, error: 'Cannot delete category that contains stories. Please move or delete the stories first.' }
        }

        // Soft delete - set deletedAt timestamp
        const category = await prisma.category.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date()
            }
        })

        return { success: true, data: category }
    } catch (error) {
        console.error('Error deleting category:', error)
        return { success: false, error: 'Failed to delete category' }
    }
}

export async function restoreCategory(id: number) {
    try {
        const category = await prisma.category.update({
            where: {
                id
            },
            data: {
                deletedAt: null,
                updatedAt: new Date()
            }
        })

        return { success: true, data: category }
    } catch (error) {
        console.error('Error restoring category:', error)
        return { success: false, error: 'Failed to restore category' }
    }
}
