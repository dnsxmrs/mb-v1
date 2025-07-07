'use server'

import { prisma } from '@/utils/prisma'

interface WeeklyTrends {
    storiesChange: number
    codesChange: number
    submissionsChange: number
    averageScoreChange: number
    currentAverageScore: number
}

export async function getWeeklyTrends(): Promise<{
    success: boolean
    data?: WeeklyTrends
    error?: string
}> {
    try {
        // Get current date and calculate date ranges
        const now = new Date()
        const currentWeekStart = new Date(now)
        currentWeekStart.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)
        currentWeekStart.setHours(0, 0, 0, 0)

        const currentWeekEnd = new Date(currentWeekStart)
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6) // End of current week (Saturday)
        currentWeekEnd.setHours(23, 59, 59, 999)

        const lastWeekStart = new Date(currentWeekStart)
        lastWeekStart.setDate(currentWeekStart.getDate() - 7)

        const lastWeekEnd = new Date(currentWeekEnd)
        lastWeekEnd.setDate(currentWeekEnd.getDate() - 7)

        // Fetch current week data
        const [currentStories, currentCodes, currentSubmissions] = await Promise.all([
            // Stories created this week
            prisma.story.count({
                where: {
                    createdAt: {
                        gte: currentWeekStart,
                        lte: currentWeekEnd
                    },
                    deletedAt: null
                }
            }),

            // Codes created this week
            prisma.code.count({
                where: {
                    createdAt: {
                        gte: currentWeekStart,
                        lte: currentWeekEnd
                    },
                    deletedAt: null
                }
            }),

            // Submissions this week
            prisma.studentSubmission.count({
                where: {
                    submittedAt: {
                        gte: currentWeekStart,
                        lte: currentWeekEnd
                    },
                    deletedAt: null
                }
            })
        ])

        // Fetch last week data
        const [lastWeekStories, lastWeekCodes, lastWeekSubmissions] = await Promise.all([
            // Stories created last week
            prisma.story.count({
                where: {
                    createdAt: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd
                    },
                    deletedAt: null
                }
            }),

            // Codes created last week
            prisma.code.count({
                where: {
                    createdAt: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd
                    },
                    deletedAt: null
                }
            }),

            // Submissions last week
            prisma.studentSubmission.count({
                where: {
                    submittedAt: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd
                    },
                    deletedAt: null
                }
            })
        ])

        // Calculate average scores for both weeks (convert to percentages)
        const [currentWeekScores, lastWeekScores] = await Promise.all([
            // Current week average score with quiz totals
            prisma.studentSubmission.findMany({
                where: {
                    submittedAt: {
                        gte: currentWeekStart,
                        lte: currentWeekEnd
                    },
                    deletedAt: null,
                    score: {
                        not: null
                    }
                },
                select: {
                    score: true,
                    Story: {
                        select: {
                            _count: {
                                select: {
                                    QuizItems: true
                                }
                            }
                        }
                    }
                }
            }),

            // Last week average score with quiz totals
            prisma.studentSubmission.findMany({
                where: {
                    submittedAt: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd
                    },
                    deletedAt: null,
                    score: {
                        not: null
                    }
                },
                select: {
                    score: true,
                    Story: {
                        select: {
                            _count: {
                                select: {
                                    QuizItems: true
                                }
                            }
                        }
                    }
                }
            })
        ])

        // Calculate average percentages
        const calculateAveragePercentage = (submissions: {
            score: number | null;
            Story: {
                _count: {
                    QuizItems: number;
                };
            };
        }[]) => {
            if (submissions.length === 0) return 0

            const totalPercentage = submissions.reduce((sum, submission) => {
                const score = submission.score || 0
                const totalQuestions = submission.Story._count.QuizItems || 1
                const percentage = (score / totalQuestions) * 100
                return sum + percentage
            }, 0)

            return totalPercentage / submissions.length
        }

        const currentAvgScore = calculateAveragePercentage(currentWeekScores)
        const lastAvgScore = calculateAveragePercentage(lastWeekScores)
        const averageScoreChange = currentAvgScore - lastAvgScore

        // Get overall average score (for display) - convert to percentage
        const overallSubmissions = await prisma.studentSubmission.findMany({
            where: {
                deletedAt: null,
                score: {
                    not: null
                }
            },
            select: {
                score: true,
                Story: {
                    select: {
                        _count: {
                            select: {
                                QuizItems: true
                            }
                        }
                    }
                }
            }
        })

        const overallAverageScore = calculateAveragePercentage(overallSubmissions)

        // Calculate changes
        const storiesChange = currentStories - lastWeekStories
        const codesChange = currentCodes - lastWeekCodes
        const submissionsChange = currentSubmissions - lastWeekSubmissions

        return {
            success: true,
            data: {
                storiesChange,
                codesChange,
                submissionsChange,
                averageScoreChange,
                currentAverageScore: overallAverageScore
            }
        }
    } catch (error) {
        console.error('Error fetching weekly trends:', error)
        return {
            success: false,
            error: 'Failed to fetch weekly trends'
        }
    }
}
