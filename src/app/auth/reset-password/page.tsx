'use client'
import React, { useEffect, useState } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [secondFactor, setSecondFactor] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/teacher/dashboard')
    }
  }, [isSignedIn, router])

  if (!isLoaded) {
    return null
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault()
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then(() => {
        setSuccessfulCreation(true)
        setError('')
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage)
        setError(err.errors[0].longMessage)
      })
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset(e: React.FormEvent) {
    e.preventDefault()
    // confirm first if password and confirmPassword are the same
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        // Check if 2FA is required
        if (result.status === 'needs_second_factor') {
          setSecondFactor(true)
          setError('')
        } else if (result.status === 'complete') {
          // Set the active session to
          // the newly created session (user is now signed in)
          setActive({ session: result.createdSessionId })
          setError('')
        } else {
          console.log(result)
        }
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage)
        setError(err.errors[0].longMessage)
      })
  }

  return (
    <div className="flex flex-col h-[85vh]">
      <div className="relative flex flex-col h-[85vh] bg-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Background image goes to the back */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
            style={{ backgroundImage: 'url("/images/blue-bg.jpg")' }}
          ></div>

          {/* White overlay in front of the image */}
          <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#60A5FA] opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* Form Container */}
          <div className="relative z-10 w-full max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-[#DBEAFE]">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 sm:mb-6 text-center">
                Forgot Password?
              </h1>
              
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
                      className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 transition duration-200 shadow-sm"
                    >
                      Send password reset code
                    </button>
                    {error && <p className="text-red-500 text-xs sm:text-sm mt-1.5 sm:mt-2">{error}</p>}
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
                      className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 transition duration-200 shadow-sm"
                    >
                      Reset Password
                    </button>
                    {error && <p className="text-red-500 text-xs sm:text-sm mt-1.5 sm:mt-2">{error}</p>}
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
        </main>
      </div>
    </div>
  )
}

export default ForgotPasswordPage