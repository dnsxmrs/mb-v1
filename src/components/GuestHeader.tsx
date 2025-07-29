'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function GuestHeader() {
    const pathname = usePathname();
    const [loadingStates, setLoadingStates] = useState({
        home: false,
        teachers: false,
        dashboard: false
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigation = (type: 'home' | 'teachers' | 'dashboard') => {
        setLoadingStates(prev => ({ ...prev, [type]: true }));
        setIsMobileMenuOpen(false); // Close mobile menu on navigation
        // Reset loading state after a short delay (optional, for better UX)
        setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, [type]: false }));
        }, 1000);
    };

    const LoadingSpinner = () => (
        <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <header className="w-full bg-[#DBEAFE] border-b border-[#60A5FA]/20">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-6 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/magandang-buhay-rbg.png"
                        alt="E-KWENTO Logo"
                        width={40}
                        height={40}
                        className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 mr-1.5 xs:mr-2"
                    />
                    <h1 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#1E3A8A]">
                        E-KWENTO
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <div className='hidden md:flex items-center space-x-4 lg:space-x-6'>
                    <Link href="/" className="font-medium text-[#1E3A8A] hover:underline text-sm lg:text-base">
                        Home
                    </Link>
                    <Link href="/libraries" className="font-medium text-[#1E3A8A] hover:underline text-sm lg:text-base">
                        Libraries
                    </Link>
                    <Link href="/games" className="font-medium text-[#1E3A8A] hover:underline text-sm lg:text-base">
                        Games
                    </Link>
                </div>

                {/* Desktop Menu Button */}
                <button
                    className="md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                >
                    <span className={`block w-5 h-0.5 bg-[#1E3A8A] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                    <span className={`block w-5 h-0.5 bg-[#1E3A8A] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-5 h-0.5 bg-[#1E3A8A] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </button>

                <div className="hidden md:flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <SignedOut>
                        <div className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-xs sm:text-sm lg:text-base rounded-full px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 font-medium transition duration-200 shadow-sm">
                            {pathname === '/login' || pathname === '/reset-password' ? (
                                <Link
                                    href="/"
                                    className="w-full h-full flex items-center justify-center"
                                    onClick={() => handleNavigation('home')}
                                >
                                    {loadingStates.home && <LoadingSpinner />}
                                    Home
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="w-full h-full flex items-center justify-center"
                                    onClick={() => handleNavigation('teachers')}
                                >
                                    {loadingStates.teachers && <LoadingSpinner />}
                                    <span className="hidden xs:inline">For Teachers</span>
                                    <span className="xs:hidden">Teachers</span>
                                </Link>
                            )}
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <Link href="/dashboard" className='mr-1 xs:mr-2 sm:mr-4'>
                            <button
                                className="bg-[#1E40AF] hover:bg-[#3B82F6] text-white text-xs sm:text-sm lg:text-base rounded-full px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 font-medium transition duration-200 shadow-sm flex items-center justify-center"
                                onClick={() => handleNavigation('dashboard')}
                            >
                                {loadingStates.dashboard && <LoadingSpinner />}
                                <span className="hidden xs:inline">Go to Dashboard</span>
                                <span className="xs:hidden">Dashboard</span>
                            </button>
                        </Link>
                        {/* center the user button in the div */}
                        <div className="scale-75 xs:scale-90 sm:scale-100 flex items-center justify-center">
                            <UserButton
                                appearance={{
                                    elements: {
                                        userPreview: {
                                            display: "none",
                                        },
                                    },
                                }}
                                userProfileProps={{
                                    appearance: {
                                        elements: {
                                            profileSectionPrimaryButton__profile: {
                                                display: "none",
                                            },
                                            profileSection__connectedAccounts: {
                                                display: "none",
                                            },
                                            profileSectionPrimaryButton__emailAddresses: {
                                                display: "none",
                                            },
                                            profileSection__danger: {
                                                display: "none",
                                            },
                                            menuButtonEllipsis: {
                                                display: "none",
                                            }
                                        },
                                    },
                                }}
                            />
                        </div>
                    </SignedIn>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#DBEAFE] border-t border-[#60A5FA]/20">
                    <div className="px-3 xs:px-4 py-3 space-y-3">
                        <div className="flex items-center justify-center">
                            <Link
                                href="/"
                                className="font-medium text-[#1E3A8A] hover:text-[#60A5FA] py-2 px-10 text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/libraries"
                                className="font-medium text-[#1E3A8A] hover:text-[#60A5FA] py-2 px-10 text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Libraries
                            </Link>
                            <Link
                                href="/games"
                                className="font-medium text-[#1E3A8A] hover:text-[#60A5FA] py-2 px-10 text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Games
                            </Link>
                        </div>
                        <div className="pt-3 border-t border-[#60A5FA]/20">
                            <SignedOut>
                                <div className="w-full">
                                    {pathname === '/login' || pathname === '/reset-password' ? (
                                        <Link
                                            href="/"
                                            className="block w-full bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-center text-sm rounded-lg px-4 py-2.5 font-medium transition duration-200"
                                            onClick={() => handleNavigation('home')}
                                        >
                                            {loadingStates.home && <LoadingSpinner />}
                                            Home
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="block w-full bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-center text-sm rounded-lg px-4 py-2.5 font-medium transition duration-200"
                                            onClick={() => handleNavigation('teachers')}
                                        >
                                            {loadingStates.teachers && <LoadingSpinner />}
                                            For Teachers
                                        </Link>
                                    )}
                                </div>
                            </SignedOut>

                            <SignedIn>
                                <div className="flex items-center space-x-3">
                                    <Link href="/dashboard" className="flex-1">
                                        <button
                                            className="w-full bg-[#1E40AF] hover:bg-[#3B82F6] text-white text-sm rounded-lg px-4 py-2.5 font-medium transition duration-200"
                                            onClick={() => handleNavigation('dashboard')}
                                        >
                                            {loadingStates.dashboard && <LoadingSpinner />}
                                            Go to Dashboard
                                        </button>
                                    </Link>
                                    <div className="flex items-center justify-center">
                                        <UserButton />
                                    </div>
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}