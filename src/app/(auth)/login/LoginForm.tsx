'use client'
import React, { useEffect, useState } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { env } from 'process'

const LoginForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const { isSignedIn } = useAuth()
    const { isLoaded, signIn, setActive } = useSignIn()

    useEffect(() => {
        if (isSignedIn) {
            router.push('/dashboard')
        }
    }, [isSignedIn, router])

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (!signIn) {
                throw new Error('Sign in is not available')
            }

            const result = await signIn.create({
                identifier: email,
                password,
            })

            if (result?.status === 'complete') {
                await setActive({ session: result.createdSessionId })
                toast.success('Login successful')
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
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Card Container */}
            <div className="relative">
                {/* Background Elements */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient"></div>

                {/* Main Card */}
                <div className="relative bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-100">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600 text-sm sm:text-base">Please sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="e.g john@doe.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-900 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-900 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <a
                                href="/reset-password"
                                className="text-sm text-blue-600 hover:text-blue-700 transition duration-200 hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600 text-center">
                                    {error}
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginForm 