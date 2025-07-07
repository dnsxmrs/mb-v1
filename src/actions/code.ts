// src/actions/code.ts
'use server'

import { prisma } from '@/utils/prisma'

export async function handleCodeSubmit(formData: FormData) {
    const code = formData.get('code') as string;

    if (!code || code.length < 4) {
        return {
            success: false,
            error: 'Code must be at least 4 characters long'
        };
    }

    const codeTrimmed = code.trim().toUpperCase();

    const storyResult = await getStoryByCode(codeTrimmed);

    if (!storyResult.success) {
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

        if (!codeRecord) {
            return {
                success: false,
                error: 'Invalid code or code has expired'
            };
        }

        return {
            success: true,
            data: {
                code: codeRecord.code,
                codeId: codeRecord.id,
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
