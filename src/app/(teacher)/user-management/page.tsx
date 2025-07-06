'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { getUsers, deleteUser } from '@/actions/user'
import Modal from '@/components/Modal'
import UserForm from '@/components/UserForm'
// import InvitationManager from '@/components/InvitationManager'

interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    status: string
    created_at: Date
    modified_at: Date
    _count: {
        CreatedCodes: number
    }
}

export default function UserManagement() {
    const { user: currentUser } = useUser()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    // const [isInvitationManagerOpen, setIsInvitationManagerOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null)

    const loadUsers = async () => {
        setLoading(true)
        setError('')
        try {
            const result = await getUsers()
            if (result.success) {
                setUsers(result.users || [])
            } else {
                const errorMsg = result.error || 'Failed to load users'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'An unexpected error occurred while loading users'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsEditModalOpen(true)
    }

    const handleDelete = async (user: User) => {
        try {
            const result = await deleteUser(user.id)
            if (result.success) {
                toast.success(result.message || `User "${user.first_name} ${user.last_name}" has been deleted successfully`)
                setDeleteConfirm(null)
                loadUsers() // Refresh the list
            } else {
                const errorMsg = result.error || 'Failed to delete user'
                toast.error(errorMsg)
                setError(errorMsg)
            }
        } catch {
            const errorMsg = 'An unexpected error occurred while deleting the user'
            toast.error(errorMsg)
            setError(errorMsg)
        }
    }

    // Check if the user is the current logged-in user
    const isCurrentUser = (user: User) => {
        return currentUser?.emailAddresses?.[0]?.emailAddress === user.email
    }

    const handleFormSuccess = () => {
        // Determine the action based on which modal was open
        if (isCreateModalOpen) {
            toast.success('User has been created successfully!')
        } else if (isEditModalOpen) {
            toast.success('User has been updated successfully!')
        }

        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedUser(null)
        loadUsers() // Refresh the list
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800'
            case 'teacher': return 'bg-blue-100 text-blue-800'
            case 'student': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-yellow-100 text-yellow-800'
            case 'invited': return 'bg-blue-100 text-blue-800'
            case 'suspended': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading users...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
                </div>
                <div className="flex space-x-3">
                    {/* <button
                        onClick={() => setIsInvitationManagerOpen(true)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 1.05a3 3 0 002.11 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Invitations</span>
                    </button> */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created Codes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-lg font-medium">No users found</p>
                                            <p className="text-sm">Get started by creating your first user.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium text-sm">
                                                            {user.first_name[0]}{user.last_name[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user._count.CreatedCodes}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="Edit user"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {isCurrentUser(user) ? (
                                                    <button
                                                        disabled
                                                        className="text-gray-400 cursor-not-allowed"
                                                        title="You cannot delete your own account"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(user)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New User"
            >
                <UserForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit User"
            >
                {selectedUser && (
                    <UserForm
                        user={selectedUser}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete User"
            >
                {deleteConfirm && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Warning: Complete Account Deletion
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>This action will permanently delete:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>The user record from the database</li>
                                            {deleteConfirm.status === 'invited' ? (
                                                <li>The pending email invitation (if not yet accepted)</li>
                                            ) : (
                                                <li>The associated Clerk authentication account</li>
                                            )}
                                            <li>All user access and login capabilities</li>
                                        </ul>
                                        {deleteConfirm.status === 'invited' && (
                                            <p className="mt-2 text-yellow-600 font-medium">
                                                Note: This user has not yet accepted their invitation.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong> ({deleteConfirm.email})?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Invitation Manager */}
            {/* <InvitationManager
                isOpen={isInvitationManagerOpen}
                onClose={() => setIsInvitationManagerOpen(false)}
            /> */}
        </div>
    )
}


