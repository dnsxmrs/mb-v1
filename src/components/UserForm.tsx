'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { createUser, updateUser, inviteUser, CreateUserData, UpdateUserData, InviteUserData } from '@/actions/user'
import SubmitButton from '@/components/SubmitButton'

interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    status: string
}

interface UserFormProps {
    user?: User
    onSuccess: () => void
    onCancel: () => void
}

const STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'invited', label: 'Invited' },
    { value: 'suspended', label: 'Suspended' }
]

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
    const [error, setError] = useState('')
    // const [inviteMode, setInviteMode] = useState(true)
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = async (formData: FormData) => {
        setError('')

        const email = formData.get('email') as string
        const first_name = formData.get('first_name') as string
        const last_name = formData.get('last_name') as string
        const role = 'admin'
        const status = formData.get('status') as string
        const sendInvitation = true

        // Validation
        if (!email || !first_name || !last_name || !role || !status) {
            const errorMsg = 'Please fill in all required fields'
            setError(errorMsg)
            toast.error(errorMsg)
            return
        }

        try {
            let result

            if (user) {
                // Update existing user
                const updateData: UpdateUserData = {
                    email,
                    first_name,
                    last_name,
                    role,
                    status
                }

                result = await updateUser(user.id, updateData)
            } else if (sendInvitation) {
                // Send invitation (creates user with invited status)
                const inviteData: InviteUserData = {
                    email,
                    first_name,
                    last_name,
                    role
                }

                result = await inviteUser(inviteData)
            } else {
                // Create new user without invitation
                const createData: CreateUserData = {
                    email,
                    first_name,
                    last_name,
                    role,
                    status,
                    sendInvitation
                }

                result = await createUser(createData)
            }

            if (result.success) {
                onSuccess()
            } else {
                const errorMsg = result.error || 'An error occurred'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'An unexpected error occurred'
            setError(errorMsg)
            toast.error(errorMsg)
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4 text-black">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        placeholder='Juan'
                        defaultValue={user?.first_name || ''}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        placeholder='dela Cruz'
                        defaultValue={user?.last_name || ''}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder='email@gmail.com'
                    defaultValue={user?.email || ''}
                    required
                    readOnly={!!user}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        user ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                />
            </div>

            {/* <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!user && '*'}
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                    required={!user}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="role"
                        name="role"
                        defaultValue={user?.role || 'student'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {ROLES.map(role => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div> */}

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="status"
                        name={user ? "status" : ""}
                        defaultValue={user?.status || 'invited'}
                        required={!!user}
                        disabled={!user}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !user ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                        }`}
                    >
                        {STATUSES.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    {!user && (
                        <>
                            <input type="hidden" name="status" value="invited" />
                            <p className="text-xs text-gray-500 mt-1">
                                New users are automatically set to &quot;Invited&quot; status
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <SubmitButton>
                    {user ? 'Update User' : 'Create User'}
                </SubmitButton>
            </div>
        </form>
    )
}
