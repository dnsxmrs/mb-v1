import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/utils/prisma'

export async function POST(request: NextRequest) {
    console.log('🔥 API route called: /api/user/update-status')

    try {
        const { email } = await request.json()

        if (!email) {
            console.log('❌ No email provided in request')
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            )
        }

        console.log('✅ Email provided:', email)

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
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        console.log('✅ User found with current status:', existingUser.status)

        // Only update if status is 'invited' to prevent unnecessary updates
        if (existingUser.status !== 'invited') {
            console.log('ℹ️ User status is already:', existingUser.status, 'for email:', email)
            return NextResponse.json({
                success: true,
                message: 'User status is already active or not invited'
            })
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

        return NextResponse.json({
            success: true,
            message: 'User status updated to active'
        })
    } catch (error) {
        console.error('💥 Error in update-status API:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user status' },
            { status: 500 }
        )
    }
}
