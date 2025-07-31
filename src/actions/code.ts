// src/actions/code.ts
'use server'

import { prisma } from '@/utils/prisma'
import { createNotification } from './notification';

// main page code validation
export async function handleCodeSubmit(code: string) {
    if (!code || code.length < 6) {
        return {
            success: false,
            error: 'Code must be at least 6 characters long'
        };
    }

    const codeTrimmed = code.trim().toUpperCase();

    const codeRecord = await prisma.code.findUnique({
        where: {
            code: codeTrimmed,
            status: 'active',
            deletedAt: null
        },
    });

    if (!codeRecord) {
        return {
            success: false,
            error: 'Invalid code. Please check and try again.'
        };
    }

    // Don't redirect here — return success and redirect on the client side
    return {
        success: true,
        redirectTo: `/student/info?code=${codeTrimmed}`
    };
}

export async function generateAccessCode(storyId: number, createdById: number) {
    try {
        // Generate a random 6-character alphanumeric code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Check if code already exists, regenerate if needed
        const existingCode = await prisma.code.findUnique({
            where: { code }
        });

        if (existingCode) {
            // Regenerate if code exists (rare collision)
            return generateAccessCode(storyId, createdById);
        }

        // Create the code in database
        const newCode = await prisma.code.create({
            data: {
                code,
                storyId,
                createdById
            },
            include: {
                Story: {
                    select: {
                        title: true
                    }
                }
            }
        });

        await createNotification('code_generated', `Code '${newCode.code}' generated for story '${newCode.Story.title}'`);

        return {
            success: true,
            data: {
                code: newCode.code,
                storyTitle: newCode.Story.title
            }
        };
    } catch (error) {
        console.error('Error generating access code:', error);
        return {
            success: false,
            error: 'Failed to generate access code'
        };
    }
}

export async function getStoryByCode(code: string) {
    try {
        const codeRecord = await prisma.code.findUnique({
            where: {
                code: code.toUpperCase(),
                deletedAt: null
            },
            include: {
                Story: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        description: true,
                        fileLink: true,
                        subtitles: true,
                        QuizItems: {
                            where: {
                                deletedAt: null
                            },
                            select: {
                                id: true,
                                quizNumber: true,
                                question: true,
                                choices: {
                                    where: {
                                        deletedAt: null
                                    },
                                    select: {
                                        id: true,
                                        text: true
                                    }
                                },
                                correctAnswer: true
                            },
                            orderBy: {
                                quizNumber: 'asc'
                            }
                        }
                    }
                }
            }
        });

        if (!codeRecord || codeRecord.deletedAt) {
            return {
                success: false,
                error: 'Invalid code or code not found'
            };
        }

        return {
            success: true,
            data: {
                code: codeRecord.code,
                codeId: codeRecord.id,
                isActive: codeRecord.status === 'active',
                story: codeRecord.Story
            }
        };
    } catch (error) {
        console.error('Error getting story by code:', error);
        return {
            success: false,
            error: 'Failed to retrieve story'
        };
    }
}

export async function updateCodeStatus(codeId: number, status: string) {
    try {
        const updatedCode = await prisma.code.update({
            where: { id: codeId },
            data: { status }
        });

        await createNotification('code_status_updated', `Code '${updatedCode.code}' status updated to '${status}'`);

        return {
            success: true,
            data: updatedCode
        };
    } catch (error) {
        console.error('Error updating code status:', error);
        return {
            success: false,
            error: 'Failed to update code status'
        };
    }
}
