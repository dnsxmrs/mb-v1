'use client'

import { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export default function SubmitButton({
  children,
  className = '',
  variant = 'primary',
  disabled = false
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Naglo-load...
        </div>
      ) : children}
    </button>
  )
}
