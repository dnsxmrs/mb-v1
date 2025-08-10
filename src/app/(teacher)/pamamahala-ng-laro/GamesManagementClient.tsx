'use client'

import { useState } from 'react'
import { Search, Gift, Plus } from 'lucide-react'
import WordSearchTable from './components/WordSearchTable'
import MysteryBoxTable from './components/MysteryBoxTable'
import AddContentModal from './components/AddContentModal'

type GameType = 'word-search' | 'mystery-box'

export default function GamesManagementClient() {
    const [activeTab, setActiveTab] = useState<GameType>('word-search')
    const [showAddModal, setShowAddModal] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleAddSuccess = () => {
        // Trigger refresh of both tables by incrementing key
        setRefreshKey(prev => prev + 1)
        setShowAddModal(false)
    }

    const tabs = [
        {
            id: 'word-search' as GameType,
            name: 'Hanap-Salita',
            icon: Search,
            color: 'blue'
        },
        {
            id: 'mystery-box' as GameType,
            name: 'Kahon ng Misteryo',
            icon: Gift,
            color: 'purple'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Tabs Navigation - Mobile First */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${isActive
                                        ? tab.color === 'blue'
                                            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                            : 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    } sm:flex-1`}
                            >
                                <Icon size={18} />
                                <span>{tab.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Add Content Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'word-search' ? 'Nilalaman ng Hanap-Salita' : 'Nilalaman ng Kahon ng Misteryo'}
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${activeTab === 'word-search'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Magdagdag ng Nilalaman</span>
                    <span className="sm:hidden">Dagdag</span>
                </button>
            </div>

            {/* Content Tables */}
            <div className="overflow-hidden">
                {activeTab === 'word-search' && <WordSearchTable key={refreshKey} />}
                {activeTab === 'mystery-box' && <MysteryBoxTable key={refreshKey} />}
            </div>

            {/* Add Content Modal */}
            {showAddModal && (
                <AddContentModal
                    gameType={activeTab}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    )
}
