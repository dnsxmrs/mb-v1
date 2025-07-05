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

    const handleNavigation = (type: 'home' | 'teachers' | 'dashboard') => {
        setLoadingStates(prev => ({ ...prev, [type]: true }));
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/magandang-buhay-rbg.png"
                        alt="Magandang Buhay Logo"
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 mr-2"
                    />
                    <h1 className="text-base sm:text-lg md:text-2xl font-bold text-[#1E3A8A]">
                        Magandang Buhay!
                    </h1>
                </Link>

                <div className='sm:flex items-center space-x-6'>
                    <Link href="/" className="font-medium text-[#1E3A8A] hover:underline">
                        Home
                    </Link>
                    <Link href="/#" className="font-medium text-[#1E3A8A] hover:underline">
                        Libraries
                    </Link>

                    <Link href="/#" className="font-medium text-[#1E3A8A] hover:underline">
                        Games
                    </Link>

                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                    <SignedOut>
                        <div className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition duration-200 shadow-sm">
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
                                    className="w-full h-full  flex items-center justify-center"
                                    onClick={() => handleNavigation('teachers')}
                                >
                                    {loadingStates.teachers && <LoadingSpinner />}
                                    For Teachers
                                </Link>
                            )}
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <Link href="/dashboard" className='mr-2 sm:mr-4'>
                            <button
                                className="bg-[#1E40AF] hover:bg-[#3B82F6] text-white text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition duration-200 shadow-sm flex items-center justify-center"
                                onClick={() => handleNavigation('dashboard')}
                            >
                                {loadingStates.dashboard && <LoadingSpinner />}
                                Go to Dashboard
                            </button>
                        </Link>
                        {/* center the user button in the div */}
                        <div className="scale-90 sm:scale-120 flex items-center justify-center">
                            <UserButton />
                        </div>
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}