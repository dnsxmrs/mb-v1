'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, MoreVertical, Gift } from 'lucide-react'

interface MysteryBoxItem {
    id: number
    title: string
    category: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    questions: number
    rewards: string[]
    createdAt: string
    status: 'Active' | 'Draft'
}

// Mock data - replace with actual data fetching
const mockMysteryBoxData: MysteryBoxItem[] = [
    {
        id: 1,
        title: 'Filipino Riddles',
        category: 'Culture',
        difficulty: 'Easy',
        questions: 5,
        rewards: ['Badge: Culture Expert', '10 points'],
        createdAt: '2025-01-14',
        status: 'Active'
    },
    {
        id: 2,
        title: 'Math Puzzles',
        category: 'Mathematics',
        difficulty: 'Medium',
        questions: 8,
        rewards: ['Badge: Math Wizard', '20 points', 'Certificate'],
        createdAt: '2025-01-12',
        status: 'Active'
    },
    {
        id: 3,
        title: 'Science Quiz',
        category: 'Science',
        difficulty: 'Hard',
        questions: 10,
        rewards: ['Badge: Science Master', '30 points', 'Special Certificate'],
        createdAt: '2025-01-09',
        status: 'Draft'
    }
]

export default function MysteryBoxTable() {
    const [data, setData] = useState<MysteryBoxItem[]>(mockMysteryBoxData)
    const [showDropdown, setShowDropdown] = useState<number | null>(null)

    const handleEdit = (id: number) => {
        console.log('Edit item:', id)
        setShowDropdown(null)
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setData(data.filter(item => item.id !== id))
        }
        setShowDropdown(null)
    }

    const handleView = (id: number) => {
        console.log('View item:', id)
        setShowDropdown(null)
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800'
            case 'Medium': return 'bg-yellow-100 text-yellow-800'
            case 'Hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status: string) => {
        return status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="overflow-hidden">
            {/* Mobile View */}
            <div className="block sm:hidden">
                <div className="space-y-3 p-4">
                    {data.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.category}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(showDropdown === item.id ? null : item.id)}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {showDropdown === item.id && (
                                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
                                            <button
                                                onClick={() => handleView(item.id)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item.id)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                                    {item.difficulty}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p>Questions: {item.questions}</p>
                                <p>Rewards: {item.rewards.length}</p>
                                <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Difficulty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Questions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rewards
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{item.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                                        {item.difficulty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{item.questions} questions</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{item.rewards.length} rewards</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleView(item.id)}
                                            className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                                            title="View"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item.id)}
                                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className="text-center py-12">
                    <Gift className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No mystery box content</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first mystery box puzzle.</p>
                </div>
            )}
        </div>
    )
}
