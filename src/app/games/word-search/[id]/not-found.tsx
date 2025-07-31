import Link from 'next/link'
import GuestHeader from "@/components/GuestHeader"
import GuestFooter from "@/components/GuestFooter"
import { Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen">
            <GuestHeader />
            <div className="relative flex-1 bg-white">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
                        style={{ backgroundImage: 'url("/images/blue-bg.jpg")' }}
                    ></div>
                    <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
                </div>

                {/* Main Content */}
                <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 min-h-full flex items-center justify-center">
                    <div className="text-center">
                        <Search className="mx-auto h-24 w-24 text-gray-400 mb-6" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Word Search Not Found</h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                            The word search puzzle you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <div className="space-x-4">
                            <Link
                                href="/games/word-search"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Word Searches
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
            <GuestFooter />
        </div>
    )
}
