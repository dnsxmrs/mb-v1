
import { Suspense } from 'react'
import GamesManagementClient from './GamesManagementClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pamamahala ng Laro | E-KWENTO',
    description: 'Pamahalaan ang nilalaman ng mga educational games',
}

export default function GamesManagementPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pamamahala ng Laro</h1>
                        <p className="text-gray-600">Pamahalaan ang nilalaman para sa Hanap-Salita at Mystery Box na laro</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    }>
                        <GamesManagementClient />
                    </Suspense>
                </div>

            </div>
        </div>
    )
}