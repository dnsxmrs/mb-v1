'use client'
import React, { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { env } from 'process'
const ResetPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [secondFactor, setSecondFactor] = useState(false)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  if (!isLoaded) {
    return (
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-[#DBEAFE]">
          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm sm:text-base animate-pulse">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setSuccessfulCreation(true)
      setError('')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.longMessage) {
        setError(err.errors[0].longMessage)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsCreating(false)
    }
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset(e: React.FormEvent) {
    e.preventDefault()
    setIsResetting(true)
    setError('')

    // confirm first if password and confirmPassword are the same
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsResetting(false)
      return
    }

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })

      if (result?.status === 'needs_second_factor') {
        setSecondFactor(true)
        setError('')
      } else if (result?.status === 'complete') {
        // Set the active session to
        // the newly created session (user is now signed in)
        await setActive?.({ session: result.createdSessionId })
        setError('')
        toast.success('Password reset successful')
        router.push('/dashboard')
      } else {
        if (env.NODE_ENV === "development") {
          console.log(result)
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.longMessage) {
        console.error('error', err.errors[0].longMessage)
        setError(err.errors[0].longMessage)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-[#DBEAFE]">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#1E3A8A] hover:text-[#3B82F6] mb-4 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 sm:mb-6 text-center">
          Forgot Password?
        </h1>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={!successfulCreation ? create : reset} className="space-y-3 sm:space-y-4">
          {!successfulCreation && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-medium text-[#1E3A8A] mb-1.5 sm:mb-2">
                  Provide your email address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="e.g john@doe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-[#1E3A8A] bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#60A5FA] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 transition duration-200 shadow-sm flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send password reset code'
                )}
              </button>
            </>
          )}

          {successfulCreation && (
            <>
              <div>
                <label htmlFor="code" className="block text-sm sm:text-base font-medium text-[#1E3A8A] mb-1.5 sm:mb-2">
                  Enter the password reset code that was sent to your email
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-[#1E3A8A] bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#60A5FA] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm sm:text-base font-medium text-[#1E3A8A] mb-1.5 sm:mb-2">
                  Enter your new password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-[#1E3A8A] bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#60A5FA] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-medium text-[#1E3A8A] mb-1.5 sm:mb-2">
                  Confirm your new password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-[#1E3A8A] bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#60A5FA] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 transition duration-200 shadow-sm flex items-center justify-center"
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </>
          )}

          {secondFactor && (
            <p className="text-[#1E3A8A] text-xs sm:text-sm text-center">
              2FA is required, but this UI does not handle that
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordForm 