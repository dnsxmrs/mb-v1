// src/components/ClientForm.tsx
'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { handleCodeSubmit } from '@/actions/code'
import { useRouter } from 'next/navigation'

// Submit button component that uses useFormStatus
function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 transition duration-200 shadow-sm flex items-center justify-center"
        >
            {pending ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                </>
            ) : (
                'I-submit ang Code'
            )}
        </button>
    )
}

export default function ClientForm() {
    const [clientError, setClientError] = useState('')

    const router = useRouter()

    // Handle client-side validation
    async function handleFormAction(formData: FormData) {
        setClientError('')

        const code = formData.get('code') as string
        if (!code || code.length < 4) {
            setClientError('Code must be at least 4 characters long')
            return
        }

        const result = await handleCodeSubmit(formData)

        if (result.success && result.redirectTo) {
            router.push(result.redirectTo)
        } else if (result.error) {
            setClientError(result.error)
        }
    }

    return (
        <form action={handleFormAction} className="space-y-4">
            {clientError && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 text-center">{clientError}</p>
                </div>
            )}
            <div>
                <input
                    type="text"
                    name="code"
                    placeholder="Ilagay ang iyong code dito"
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-[#1E3A8A] text-center bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#60A5FA] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm text-sm sm:text-base"
                    required
                />
            </div>
            <SubmitButton />
        </form>
    )
}