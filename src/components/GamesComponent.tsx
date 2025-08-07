'use client'

import { Search, Gift } from 'lucide-react'
import Link from 'next/link'

export default function GamesComponent() {

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-4">
                    Mga Edukasyonal na Laro
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Matuto habang nag-eenjoy! Pumili mula sa aming interactive educational games.
                </p>
            </div>

            {/* Games Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Word Search Game */}
                <Link href="/mga-laro/hanap-salita">
                    <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-300 overflow-hidden">
                        {/* Content */}
                        <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3">
                            <div className="text-white p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Hanap-Salita
                            </h3>
                            <p className="text-white text-opacity-95 text-sm leading-relaxed">
                                Hanapin ang mga nakatagong salita sa isang grid ng mga letra. Perpekto para sa pagpapabuti ng bokabularyo at kakayahan sa pagkilala ng pattern.
                            </p>
                            <div className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-sm shadow-md">
                                Maglaro Ngayon
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Mystery Box Game */}
                <Link href="/mga-laro/mystery-box">
                    <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-300 overflow-hidden">
                        {/* Content */}
                        <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3">
                            <div className="text-white p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <Gift size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Mystery Box
                            </h3>
                            <p className="text-white text-opacity-95 text-sm leading-relaxed">
                                Tuklasin ang mga sorpresa at lutasin ang mga palaisipan sa kapana-panabik na larong ito na hamon sa iyong kritikal na pag-iisip.
                            </p>
                            <div className="bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg text-sm shadow-md">
                                Maglaro Ngayon
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
