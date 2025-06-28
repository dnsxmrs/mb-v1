'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getInvitations, revokeInvitation } from '@/actions/user'

interface Invitation {
  id: string
  emailAddress: string
  status: string
  createdAt: string
  updatedAt: string
  url?: string
  revoked?: boolean
  publicMetadata?: Record<string, unknown> | null
}

interface InvitationManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function InvitationManager({ isOpen, onClose }: InvitationManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadInvitations = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getInvitations()
      if (result.success) {
        setInvitations(result.invitations || [])
        setError('')
      } else {
        const errorMsg = result.error || 'Failed to load invitations'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch {
      const errorMsg = 'An unexpected error occurred while loading invitations'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadInvitations()
    }
  }, [isOpen])

  const handleRevoke = async (invitationId: string) => {
    try {
      const result = await revokeInvitation(invitationId)
      if (result.success) {
        toast.success('Invitation has been revoked successfully')
        loadInvitations() // Refresh the list
      } else {
        const errorMsg = result.error || 'Failed to revoke invitation'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch {
      const errorMsg = 'An unexpected error occurred while revoking invitation'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleResend = async (invitation: Invitation) => {
    try {
      // For now, just show a message since we need to map invitation to user ID
      console.log('Resending invitation for:', invitation.emailAddress)
      toast.error('Resend functionality requires user ID mapping - feature coming soon')
      setError('Resend functionality requires user ID mapping - feature coming soon')
    } catch {
      const errorMsg = 'An unexpected error occurred while resending invitation'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full'
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'revoked':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white rounded-lg px-6 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Manage Invitations
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading invitations...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No pending invitations found.
                      </td>
                    </tr>
                  ) : (
                    invitations.map((invitation) => (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invitation.emailAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(invitation.status)}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {invitation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleResend(invitation)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="Resend invitation"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 1.05a3 3 0 002.11 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleRevoke(invitation.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Revoke invitation"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
