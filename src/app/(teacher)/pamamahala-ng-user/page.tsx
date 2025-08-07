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
                const errorMsg = result.error || 'Hindi na-load ang mga user'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch {
            const errorMsg = 'May hindi inaasahang error habang nilo-load ang mga user'
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
                toast.success(result.message || `Ang user na "${user.first_name} ${user.last_name}" ay matagumpay na natanggal`)
                setDeleteConfirm(null)
                loadUsers() // Refresh the list
            } else {
                const errorMsg = result.error || 'Hindi ma-delete ang user'
                toast.error(errorMsg)
                setError(errorMsg)
            }
        } catch {
            const errorMsg = 'May hindi inaasahang error habang tinatanggal ang user'
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
            toast.success('Matagumpay na nagawa ang user!')
        } else if (isEditModalOpen) {
            toast.success('Matagumpay na na-update ang user!')
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
                    <span className="text-gray-600">Nilo-load ang mga user...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pamamahala ng User</h1>
                            <p className="text-gray-600">Pamahalaan ang inyong mga educational stories at content</p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="hidden sm:inline">Magdagdag ng User</span>
                            <span className="sm:hidden">Dagdag</span>
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
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tungkulin
                                    </th>
                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Katayuan
                                    </th>
                                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ginawang Codes
                                    </th>
                                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ginawa Noong
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mga Aksyon
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-3 sm:px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-sm sm:text-lg font-medium">Walang nakitang mga user</p>
                                                <p className="text-xs sm:text-sm">Magsimula sa pamamagitan ng paggawa ng inyong unang user.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-xs sm:text-sm">
                                                                {user.first_name[0]}{user.last_name[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                                                        {/* Show role and status on mobile as badges */}
                                                        <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                                                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                            </span>
                                                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                                                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user._count.CreatedCodes}
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('fil-PH', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: "numeric",
                                                    timeZone: 'Asia/Manila',
                                                })}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-1 sm:space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                                        title="I-edit ang user"
                                                    >
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {isCurrentUser(user) ? (
                                                        <button
                                                            disabled
                                                            className="text-gray-400 cursor-not-allowed p-1"
                                                            title="Hindi ninyo matatanggal ang inyong sariling account"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(user)}
                                                            className="text-red-600 hover:text-red-900 transition-colors p-1"
                                                            title="Tanggalin ang user"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    title="Gumawa ng Bagong User"
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
                    title="I-edit ang User"
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
                    title="Tanggalin ang User"
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
                                            Babala: Kumpletong Pagtanggal ng Account
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>Ang aksyong ito ay permanenteng magtataanggal ng:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                <li>Ang user record mula sa database</li>
                                                {deleteConfirm.status === 'invited' ? (
                                                    <li>Ang naghihintay na email invitation (kung hindi pa tinanggap)</li>
                                                ) : (
                                                    <li>Ang nauugnayang Clerk authentication account</li>
                                                )}
                                                <li>Lahat ng user access at login capabilities</li>
                                            </ul>
                                            {deleteConfirm.status === 'invited' && (
                                                <p className="mt-2 text-yellow-600 font-medium">
                                                    Tandaan: Ang user na ito ay hindi pa tumatanggap sa kanilang invitation.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700">
                                Sigurado ka bang gusto mong tanggalin si <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong> ({deleteConfirm.email})?
                                Hindi na mababalik ang aksyong ito.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Kanselahin
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Tanggalin ang User
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    )
}


