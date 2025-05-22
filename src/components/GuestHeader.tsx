'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function GuestHeader() {
    const pathname = usePathname();
    
    return (
        <header className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-6 bg-[#DBEAFE] border-b border-[#60A5FA]/20">
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

            <div className="flex items-center space-x-3 sm:space-x-4">
                <SignedOut>
                    <div className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition duration-200 shadow-sm">
                        {pathname === '/auth/login' || pathname === '/auth/reset-password' ? (
                            <Link href="/" className="w-full h-full block">
                                Home
                            </Link>
                        ) : (
                            <Link href="/auth/login" className="w-full h-full block">
                                For Teachers
                            </Link>
                        )}
                    </div>
                </SignedOut>

                <SignedIn>
                    <Link href="/dashboard" className='mr-2 sm:mr-4'>
                        <button className="bg-[#1E40AF] hover:bg-[#3B82F6] text-white text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition duration-200 shadow-sm">
                            Go to Dashboard
                        </button>
                    </Link>
                    <div className="scale-90 sm:scale-100">
                        <UserButton />
                    </div>
                </SignedIn>
            </div>
        </header>
    );
}
