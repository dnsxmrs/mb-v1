'use server'

import { PrismaClient } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'
import { createClerkClient } from '@clerk/backend'

const prisma = new PrismaClient()
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
})

export interface CreateUserData {
    email: string
    first_name: string
    last_name: string
    role: string
    status: string
    sendInvitation?: boolean
}

export interface InviteUserData {
    email: string
    first_name: string
    last_name: string
    role: string
}

export interface UpdateUserData {
    email?: string
    first_name?: string
    last_name?: string
    role?: string
    status?: string
}

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                deleted_at: null
            },
            select: {
                id: true,
                clerkId: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                status: true,
                created_at: true,
                modified_at: true,
                _count: {
                    select: {
                        CreatedCodes: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        return { success: true, users }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function createUser(data: CreateUserData) {
    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return { success: false, error: 'User with this email already exists' }
        }

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                role: data.role,
                status: data.status,
                created_at: new Date(),
                modified_at: new Date()
            }
        })

        // Send Clerk invitation if requested
        if (data.sendInvitation) {
            try {
                await clerkClient.invitations.createInvitation({
                    emailAddress: data.email,
                    publicMetadata: {
                        role: data.role,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        userId: user.id
                    },
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
                })
            } catch (clerkError) {
                console.error('Error sending Clerk invitation:', clerkError)
                // Continue execution even if invitation fails
            }
        }

        revalidatePath('/user-management')
        return { success: true, user }
    } catch (error) {
        console.error('Error creating user:', error)
        return { success: false, error: 'Failed to create user' }
    }
}

export async function inviteUser(data: InviteUserData) {
    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return { success: false, error: 'User with this email already exists' }
        }

        // Create user in database first
        const user = await prisma.user.create({
            data: {
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                role: data.role,
                status: 'invited', // Special status for invited users
                created_at: new Date(),
                modified_at: new Date()
            }
        })

        // Send Clerk invitation
        const invitation = await clerkClient.invitations.createInvitation({
            emailAddress: data.email,
            publicMetadata: {
                role: data.role,
                first_name: data.first_name,
                last_name: data.last_name,
                userId: user.id
            },
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
        })

        revalidatePath('/user-management')
        return {
            success: true,
            user,
            invitation: {
                id: invitation.id,
                status: invitation.status
            }
        }
    } catch (error) {
        console.error('Error inviting user:', error)
        return { success: false, error: 'Failed to send invitation' }
    }
}

export async function resendInvitation(userId: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const invitation = await clerkClient.invitations.createInvitation({
            emailAddress: user.email,
            publicMetadata: {
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                userId: user.id
            },
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
        })

        return {
            success: true,
            invitation: {
                id: invitation.id,
                status: invitation.status
            }
        }
    } catch (error) {
        console.error('Error resending invitation:', error)
        return { success: false, error: 'Failed to resend invitation' }
    }
}

export async function getInvitations() {
    try {
        const invitations = await clerkClient.invitations.getInvitationList()

        // Convert Clerk invitation objects to plain objects for client component serialization
        const plainInvitations = invitations.data.map(invitation => ({
            id: invitation.id,
            emailAddress: invitation.emailAddress,
            status: invitation.status,
            createdAt: new Date(invitation.createdAt).toISOString(),
            updatedAt: new Date(invitation.updatedAt).toISOString(),
            url: invitation.url,
            revoked: invitation.revoked,
            publicMetadata: invitation.publicMetadata
        }))

        return { success: true, invitations: plainInvitations }
    } catch (error) {
        console.error('Error fetching invitations:', error)
        return { success: false, error: 'Failed to fetch invitations' }
    }
}

export async function revokeInvitation(invitationId: string) {
    try {
        await clerkClient.invitations.revokeInvitation(invitationId)
        return { success: true }
    } catch (error) {
        console.error('Error revoking invitation:', error)
        return { success: false, error: 'Failed to revoke invitation' }
    }
}

export async function updateUser(id: number, data: UpdateUserData) {
    try {
        // Check if email is being updated and if it already exists
        if (data.email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: data.email,
                    id: { not: id }
                }
            })

            if (existingUser) {
                return { success: false, error: 'User with this email already exists' }
            }
        }

        const updateData: Partial<UpdateUserData & { modified_at: Date }> = {
            ...data,
            modified_at: new Date()
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/user-management')
        return { success: true, user }
    } catch (error) {
        console.error('Error updating user:', error)
        return { success: false, error: 'Failed to update user' }
    }
}

export async function deleteUser(id: number) {
    try {
        // First, get the user to retrieve their clerkId and status
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                clerkId: true,
                email: true,
                first_name: true,
                last_name: true,
                status: true
            }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        let clerkMessage = ''

        // Handle different user statuses
        if (user.status === 'invited') {
            // For invited users, we need to revoke the invitation and delete the user record
            const revocationResult = await revokeInvitationByEmail(user.email)
            clerkMessage = revocationResult.message
            console.log(`Invitation revocation for ${user.email}: ${revocationResult.success ? 'success' : 'failed'}`)
        } else {
            // For active users, delete the Clerk user account
            if (user.clerkId) {
                try {
                    await clerkClient.users.deleteUser(user.clerkId)
                    clerkMessage = 'Clerk account deleted and '
                    console.log(`Successfully deleted Clerk user: ${user.clerkId}`)
                } catch (clerkError: unknown) {
                    console.error('Error deleting from Clerk:', clerkError)
                    
                    // Check if it's a "user not found" error, which is acceptable
                    const error = clerkError as { status?: number; message?: string }
                    if (error?.status === 404 || error?.message?.includes('not found')) {
                        console.log('Clerk user already deleted or not found, proceeding with database deletion')
                        clerkMessage = 'Clerk account already removed, '
                    } else {
                        // For other errors, log but continue with database deletion
                        console.warn('Clerk deletion failed but continuing with database deletion:', error?.message || 'Unknown error')
                        clerkMessage = 'Clerk deletion failed but '
                    }
                }
            }
        }

        // Soft delete by setting deleted_at
        await prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                modified_at: new Date()
            }
        })

        revalidatePath('/user-management')
        return { 
            success: true, 
            message: `${clerkMessage}user record has been deleted successfully` 
        }
    } catch (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function getUserById(id: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                clerkId: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                status: true,
                created_at: true,
                modified_at: true
            }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        return { success: true, user }
    } catch (error) {
        console.error('Error fetching user:', error)
        return { success: false, error: 'Failed to fetch user' }
    }
}

// Helper function to find and revoke invitation by email
async function revokeInvitationByEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const invitationsResponse = await clerkClient.invitations.getInvitationList({
            status: 'pending'
        })
        
        interface ClerkInvitation {
            id: string
            emailAddress: string
            status: string
        }
        
        const userInvitation = invitationsResponse.data.find((inv: ClerkInvitation) => inv.emailAddress === email)
        
        if (userInvitation) {
            await clerkClient.invitations.revokeInvitation(userInvitation.id)
            return { success: true, message: 'Pending invitation revoked and ' }
        } else {
            return { success: true, message: 'No active invitation found, ' }
        }
    } catch (error) {
        console.error('Error revoking invitation:', error)
        return { success: false, message: 'Invitation revocation failed but ' }
    }
}
