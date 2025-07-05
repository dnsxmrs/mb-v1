'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { BookText, BookOpenCheck, Settings } from 'lucide-react';

interface TeacherNavProps {
  children: ReactNode
}

export default function TeacherNav({ children }: TeacherNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    {
      href: "/dashboard",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      name: "Dashboard",
    },
    {
      href: "/story-management",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v13m0-13C10.8 5.5 9.2 5 7.5 5S4.2 5.5 3 6.3V19c1.2-.8 2.8-1.3 4.5-1.3s3.3.5 4.5 1.3V6zM12 6c1.2-.5 2.8-1 4.5-1s3.3.5 4.5 1.3V19c-1.2-.8-2.8-1.3-4.5-1.3s-3.3.5-4.5 1.3"
        />
      ),
      name: "Story Management",
    },
    {
      href: "/quiz-management",
      icon: <BookOpenCheck />,
      name: "Quiz Management",
    },
    {
      href: "/student-log",
      icon: <BookText />,
      name: "Student Log",
    },
    {
      href: "/user-management",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      ),
      name: "User Management",
    },
    {
      href: "/settings",
      icon: <Settings />,
      name: "Settings",
    },
  ];

  return (<div className="min-h-screen bg-gray-50 flex relative">
    {/* Mobile Overlay */}
    {isMobileMenuOpen && (
      <div
        className="fixed inset-0 z-40 md:hidden transition-opacity duration-300"
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 md:w-25 bg-[#BEDBFF] transform transition-transform duration-300 ease-in-out md:transform-none flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      style={{ boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)' }}
    >        {/* Logo */}
      <div className="flex flex-col items-center justify-center h-16 mt-3">
        <Link
          href="/dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[10px] font-medium text-gray-700 px-2 mt-1 text-center items-center flex-col align-center flex gap-2 hover:text-blue-800 transition-colors"
        >
          <Image src="/images/magandang-buhay-rbg.png" alt="logo" width={30} height={30} />
          Magandang Buhay!
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex flex-col items-center py-3 rounded-lg hover:text-blue-800 transition-colors
                          ${pathname === item.href ? 'text-blue-800' : 'text-gray-700'}`}
          >
            <svg className="w-[30px] h-[30px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {item.icon}
            </svg>
            <span className="text-[12px] font-medium text-center">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
    {/* Main Area */}
    <div className="flex-1 flex flex-col min-h-screen">
      <header
        className="sticky top-0 bg-white min-h-16 sm:h-21 flex items-center px-2 sm:px-4 lg:px-8 justify-between z-10"
        style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 w-6 bg-blue-800 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 w-6 bg-blue-800 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-blue-800 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
            {/* Mobile date format */}
            <span className="text-sm font-medium text-blue-800 truncate sm:hidden">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })}
            </span>
            {/* Desktop date format */}
            <span className="hidden sm:block text-xl font-medium text-blue-800 truncate">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })}
            </span>
            <span className="hidden sm:inline-block text-gray-400 text-3xl">|</span>
            <span className="text-sm sm:text-xl font-medium text-blue-800 truncate">
              {pathname === '/dashboard' ? 'Dashboard' : pathname === '/students' ? 'Student Log' : pathname === '/story-management' ? 'Story Management' : 'User Management'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="scale-75 sm:scale-90 lg:scale-100">
            {mounted && (
              <UserButton
                showName={true}
                appearance={{
                  elements: {
                    userButtonBox: "text-blue-800 font-semibold text-lg sm:text-2xl", // container
                    userButtonName: "text-blue-800 font-semibold text-lg sm:text-2xl hidden sm:block", // name text - hide on mobile
                  }
                }}
              />
            )}
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8">
        {children}
      </main>
    </div>
  </div>
  )
}