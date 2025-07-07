// src/actions/user.ts
'use server'

import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'
import { createClerkClient } from '@clerk/backend'
import { auth } from '@clerk/nextjs/server'
import { createNotification } from './notification'

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
        const existingUser = await prisma.user.findFirst({
            where: { email: data.email, deleted_at: null }
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

        await createNotification('user_created', `User '${data.first_name} ${data.last_name}' created`)

        // Send Clerk invitation if requested
        if (data.sendInvitation) {
            try {
                await clerkClient.invitations.createInvitation({
                    emailAddress: data.email,
                    publicMetadata: {
                        role: data.role,
                        first_name: data.first_name,
                        last_name: data.last_name,
                    },
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
        const existingUser = await prisma.user.findFirst({
            where: { email: data.email, deleted_at: null }
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

        await createNotification('user_created', `User '${data.first_name} ${data.last_name}' created`)

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

// not used
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
            // redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
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
            await prisma.user.findFirst({
                where: {
                    email: data.email,
                    id: { not: id }
                }
            })

            // if (existingUser) {
            //     return { success: false, error: 'User with this email already exists' }
            // }
        }

        const updateData: Partial<UpdateUserData & { modified_at: Date }> = {
            ...data,
            modified_at: new Date()
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        await createNotification('user_updated', `User '${data.first_name} ${data.last_name}' updated`)

        revalidatePath('/user-management')
        return { success: true, user }
    } catch (error) {
        console.error('Error updating user:', error)
        return { success: false, error: 'Failed to update user' }
    }
}

export async function updateUserStatus(email: string) {
    console.log('🔥 updateUserStatus called with email:', email)

    try {
        if (!email) {
            console.log('❌ No email provided')
            return { success: false, error: 'Email is required' }
        }

        console.log('✅ Email provided, searching for user...')

        // Find the user by email to get the id
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
                deleted_at: null
            },
        })

        console.log('🔍 Database query result:', existingUser)

        if (!existingUser) {
            console.log('❌ User not found for email:', email)
            return { success: false, error: 'User not found' }
        }

        console.log('✅ User found with current status:', existingUser.status)

        // Only update if status is 'invited' to prevent unnecessary updates
        if (existingUser.status !== 'invited') {
            console.log('ℹ️ User status is already:', existingUser.status, 'for email:', email)
            return { success: true, message: 'User status is already active or not invited' }
        }

        console.log('🔄 Updating user status from invited to active for:', email)

        const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                status: 'active',
                modified_at: new Date()
            }
        })

        console.log('✅ User status updated successfully:', updatedUser)

        return { success: true, message: 'User status updated to active' }
    } catch (error) {
        console.error('💥 Error in updateUserStatus:', error)
        return { success: false, error: 'Failed to update user status' }
    }
}

export async function deleteUser(id: number) {
    try {
        // First, get the user to retrieve their clerkId and status
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
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
        } else if (user.status === 'active' || user.status === 'pending') {
            try {
                await clerkClient.users.deleteUser(user.email)
                clerkMessage = 'Clerk account deleted and '
                console.log(`Successfully deleted Clerk user: ${user.email}`)
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

        // Soft delete by setting deleted_at
        await prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                modified_at: new Date()
            }
        })

        await createNotification('user_deleted', `User '${user.first_name} ${user.last_name}' deleted`)

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

export async function getCurrentUser() {
    try {
        // Get the current user's ID from Clerk auth
        const { userId } = await auth()

        if (!userId) {
            return { success: false, error: 'Not authenticated' }
        }

        // Fetch the user's email from Clerk backend
        const clerkUser = await clerkClient.users.getUser(userId)

        if (!clerkUser || !clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
            return { success: false, error: 'User email not found in Clerk' }
        }

        // Get the primary email address
        const userEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
            clerkUser.emailAddresses[0]?.emailAddress

        if (!userEmail) {
            return { success: false, error: 'No valid email address found' }
        }

        // Find the user in the database using the email from Clerk
        const user = await prisma.user.findFirst({
            where: {
                email: userEmail,
                deleted_at: null
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true
            }
        })

        if (!user) {
            return { success: false, error: 'User not found in database' }
        }

        return { success: true, data: user }
    } catch (error) {
        console.error('Error getting current user:', error)
        return { success: false, error: 'Failed to get current user' }
    }
}

// Test server action to verify server actions are working
export async function testServerAction(email: string) {
    console.log('🧪 TEST SERVER ACTION called with:', email)
    return { success: true, message: 'Test server action works!' }
}
