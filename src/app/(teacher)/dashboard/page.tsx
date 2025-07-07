'use client'

import { useState, useEffect } from 'react'
import { getStories } from '@/actions/story'
import { generateAccessCode } from '@/actions/code'
import { getCurrentUser } from '@/actions/user'

interface Story {
  id: number
  title: string
  description: string | null
  fileLink: string
  subtitles: string[]
  createdAt: Date
  updatedAt: Date
  _count: {
    QuizItems: number
    Codes: number
    Submissions: number
  }
}

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
}

export default function TeacherDashboard() {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        // Load stories
        const storiesResult = await getStories()
        if (storiesResult.success && storiesResult.data) {
          setStories(storiesResult.data)
        }

        // Load current user
        const userResult = await getCurrentUser()
        if (userResult.success && userResult.data) {
          setCurrentUser(userResult.data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  const handleGenerateCode = async () => {
    if (!selectedStoryId || !currentUser) {
      setError('Please select a story first')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await generateAccessCode(selectedStoryId, currentUser.id)

      if (result.success && result.data) {
        setGeneratedCode(result.data.code)
      } else {
        setError(result.error || 'Failed to generate code')
      }
    } catch (error) {
      setError('An error occurred while generating the code')
      console.error('Error generating code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  // Calculate KPI values from stories data
  const totalStories = stories.length
  const totalCodes = stories.reduce((sum, story) => sum + story._count.Codes, 0)
  const totalSubmissions = stories.reduce((sum, story) => sum + story._count.Submissions, 0)

  // Mock average score (since we don't have backend for it yet)
  const averageScore = totalSubmissions > 0 ? 85.5 : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {currentUser?.first_name || 'Teacher'}! 👋
        </h1>
        <p className="text-blue-100">
          Here&apos;s what&apos;s happening with your stories and students today.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Mobile-first: Code Generator at top */}
        <div className="lg:hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">🔑</span>
                Generate Access Code
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Create codes for student access
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-black">
              {/* Step 1: Choose a story */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Select Story
                </label>
                <select
                  value={selectedStoryId || ''}
                  onChange={(e) => setSelectedStoryId(Number(e.target.value) || null)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a story...</option>
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Generate code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Generate Code
                </label>
                <button
                  onClick={handleGenerateCode}
                  disabled={isLoading || !selectedStoryId}
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⚡</span>
                      Generate Code
                    </>
                  )}
                </button>
              </div>

              {/* Step 3: Share the code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Share Code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedCode}
                    readOnly
                    placeholder="Generated code will appear here"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none text-center font-mono font-bold"
                  />
                  {generatedCode && (
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-500">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success message */}
              {generatedCode && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-500">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Code generated! Share with your students.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop layout: Grid with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - KPIs and Charts */}
          <div className="lg:col-span-2 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Total Stories KPI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stories</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStories}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <div className="w-6 h-6 text-blue-600">📚</div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600 font-medium">
                  ↗ Active content
                </span>
              </div>
            </div>

            {/* Total Codes KPI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Access Codes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCodes}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <div className="w-6 h-6 text-green-600">🔐</div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-blue-600 font-medium">
                  ↗ Generated codes
                </span>
              </div>
            </div>

            {/* Total Submissions KPI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <div className="w-6 h-6 text-purple-600">📝</div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600 font-medium">
                  ↗ Student engagement
                </span>
              </div>
            </div>

            {/* Average Score KPI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <div className="w-6 h-6 text-yellow-600">⭐</div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600 font-medium">
                  ↗ Performance
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Story Performance Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Performance</h3>
              <div className="space-y-4">
                {stories.slice(0, 5).map((story, index) => (
                  <div key={story.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {story.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {story._count.Submissions} submissions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (story._count.Submissions / Math.max(totalSubmissions, 1)) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium min-w-0">
                          {story._count.QuizItems} items
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New story submission received</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Access code generated</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Quiz completed by student</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New story added to library</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 text-2xl mb-2">📖</div>
                <span className="text-sm font-medium text-gray-700">Add Story</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 text-2xl mb-2">❓</div>
                <span className="text-sm font-medium text-gray-700">Create Quiz</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 text-2xl mb-2">👥</div>
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 text-2xl mb-2">📊</div>
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </button>
            </div>
          </div> */}
        </div>

        {/* Right Column - Code Generator (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">🔑</span>
                Generate Access Code
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Create codes for student access
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-black">
              {/* Step 1: Choose a story */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Select Story
                </label>
                <select
                  value={selectedStoryId || ''}
                  onChange={(e) => setSelectedStoryId(Number(e.target.value) || null)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a story...</option>
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Generate code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Generate Code
                </label>
                <button
                  onClick={handleGenerateCode}
                  disabled={isLoading || !selectedStoryId}
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⚡</span>
                      Generate Code
                    </>
                  )}
                </button>
              </div>

              {/* Step 3: Share the code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Share Code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedCode}
                    readOnly
                    placeholder="Generated code will appear here"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none text-center font-mono font-bold"
                  />
                  {generatedCode && (
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-500">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success message */}
              {generatedCode && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-500">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Code generated! Share with your students.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
