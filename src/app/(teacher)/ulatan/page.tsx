'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getStories } from '@/actions/story'
import { getCurrentUser } from '@/actions/user'
import { getWeeklyTrends } from '@/actions/analytics'
import { generateAccessCode } from '@/actions/code'
import { getNotifications, Notification } from '@/actions/notification'

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState({
    storiesChange: 0,
    codesChange: 0,
    submissionsChange: 0,
    averageScoreChange: 0,
    currentAverageScore: 0
  })

  // Loading states for different components
  const [isLoadingKPIs, setIsLoadingKPIs] = useState(true)
  const [isLoadingStories, setIsLoadingStories] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [isActivityOverflowing, setIsActivityOverflowing] = useState(false)
  const [isStoryPerformanceOverflowing, setIsStoryPerformanceOverflowing] = useState(false)
  const activityContentRef = useRef<HTMLDivElement>(null)
  const storyPerformanceContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load stories independently
    const loadStories = async () => {
      try {
        const result = await getStories()
        if (result.success && result.data) {
          setStories(result.data)
        }
      } catch (error) {
        console.error('Error loading stories:', error)
      } finally {
        setIsLoadingStories(false)
      }
    }

    // Load user independently
    const loadUser = async () => {
      try {
        const result = await getCurrentUser()
        if (result.success && result.data) {
          setCurrentUser(result.data)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    // Load trends independently
    const loadTrends = async () => {
      try {
        const result = await getWeeklyTrends()
        if (result.success && result.data) {
          setWeeklyTrends(result.data)
        }
      } catch (error) {
        console.error('Error loading trends:', error)
      } finally {
        setIsLoadingKPIs(false)
      }
    }

    // Load notifications independently
    const loadNotifications = async () => {
      try {
        const result = await getNotifications(10)
        if (result.success && result.data) {
          setNotifications(result.data)
          console.log('Notifications loaded:', result.data)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setIsLoadingNotifications(false)
      }
    }

    // Start all loads simultaneously but handle them independently
    loadStories()
    loadUser()
    loadTrends()
    loadNotifications()
  }, [])

  // Check if activity content overflows
  useEffect(() => {
    const checkOverflow = () => {
      if (activityContentRef.current && !isLoadingNotifications) {
        const element = activityContentRef.current
        const maxHeight = 500 // Max height before scrolling (500px)
        const contentHeight = element.scrollHeight
        setIsActivityOverflowing(contentHeight > maxHeight)
      }
    }

    checkOverflow()
    // Recheck when notifications change
  }, [notifications, isLoadingNotifications])

  // Check if story performance content overflows
  useEffect(() => {
    const checkOverflow = () => {
      if (storyPerformanceContentRef.current && !isLoadingStories) {
        const element = storyPerformanceContentRef.current
        const maxHeight = 500 // Max height before scrolling (500px)
        const contentHeight = element.scrollHeight
        setIsStoryPerformanceOverflowing(contentHeight > maxHeight)
      }
    }

    checkOverflow()
    // Recheck when stories change
  }, [stories, isLoadingStories])

  const handleGenerateCode = useCallback(async () => {
    if (!selectedStoryId || !currentUser) {
      setError('Mangyaring pumili muna ng kuwento')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await generateAccessCode(selectedStoryId, currentUser.id)

      if (result.success && result.data) {
        setGeneratedCode(result.data.code)
      } else {
        setError(result.error || 'Hindi nakagawa ng code')
      }
    } catch (error) {
      setError('May nangyaring pagkakamali habang ginagawa ang code')
      console.error('Error generating code:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedStoryId, currentUser])

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedCode)
  }, [generatedCode])

  // Helper function to get notification color based on type (moved outside or memoized for performance)
  const getNotificationColor = useMemo(() => {
    return (type: string) => {
      const baseType = type.split('_')[0] // Extract base type (story, user, code, etc.)
      switch (baseType) {
        case 'story': return 'bg-blue-500'
        case 'user': return 'bg-green-500'
        case 'code': return 'bg-purple-500'
        case 'category': return 'bg-orange-500'
        case 'system': return 'bg-gray-500'
        case 'quiz': return 'bg-yellow-500'
        case 'submission': return 'bg-pink-500'
        default: return 'bg-gray-500'
      }
    }
  }, [])

  // Helper function to format time elapsed (memoized for performance)
  const formatTimeElapsed = useMemo(() => {
    return (date: Date) => {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

      if (diffInSeconds < 60) {
        return `${diffInSeconds} segundo ang nakalipas`
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} ${minutes === 1 ? 'minuto' : 'minuto'} ang nakalipas`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} ${hours === 1 ? 'oras' : 'oras'} ang nakalipas`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} ${days === 1 ? 'araw' : 'araw'} ang nakalipas`
      }
    }
  }, [])

  // Memoize skeleton loaders to prevent unnecessary re-renders
  const kpiSkeletonLoader = useMemo(() => (
    Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="p-3 bg-gray-100 rounded-full">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    ))
  ), [])

  const storyPerformanceSkeletonLoader = useMemo(() => (
    Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    ))
  ), [])

  const recentActivitySkeletonLoader = useMemo(() => (
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-start space-x-3 animate-pulse">
        <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    ))
  ), [])

  // Memoize limited stories array to prevent unnecessary recalculations
  const limitedStories = useMemo(() => stories.slice(0, 5), [stories])
  const limitedNotifications = useMemo(() => notifications.slice(0, 10), [notifications])
  const kpiCalculations = useMemo(() => {
    const totalStories = stories.length
    const totalCodes = stories.reduce((sum, story) => sum + story._count.Codes, 0)
    const totalSubmissions = stories.reduce((sum, story) => sum + story._count.Submissions, 0)
    const averageScore = weeklyTrends.currentAverageScore

    return {
      totalStories,
      totalCodes,
      totalSubmissions,
      averageScore
    }
  }, [stories, weeklyTrends.currentAverageScore])

  // Helper function to format trend text and color (memoized)
  const formatTrend = useMemo(() => {
    return (value: number, unit: string = '', isPercentage: boolean = false) => {
      const numValue = isPercentage ? parseFloat(value.toString()) : value
      const absValue = isPercentage ? Math.abs(numValue).toFixed(0) : Math.abs(numValue)
      const sign = numValue >= 0 ? '+' : '-'

      if (numValue === 0) {
        return {
          text: `→ Walang pagbabago${unit}`,
          color: 'text-gray-600'
        }
      } else if (numValue > 0) {
        return {
          text: `↗ ${sign}${absValue}${unit} mula noong nakaraang linggo`,
          color: 'text-green-600'
        }
      } else {
        return {
          text: `↘ ${sign}${absValue}${unit} mula noong nakaraang linggo`,
          color: 'text-red-600'
        }
      }
    }
  }, [])

  // KPI data array with real weekly trends (memoized)
  const kpiData = useMemo(() => [
    {
      title: "Kabuuang Kuwento",
      value: kpiCalculations.totalStories,
      icon: "📚",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: formatTrend(weeklyTrends.storiesChange).text,
      trendColor: formatTrend(weeklyTrends.storiesChange).color
    },
    {
      title: "Mga Access Code",
      value: kpiCalculations.totalCodes,
      icon: "🔐",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: formatTrend(weeklyTrends.codesChange).text,
      trendColor: formatTrend(weeklyTrends.codesChange).color
    },
    {
      title: "Mga Sinumite",
      value: kpiCalculations.totalSubmissions,
      icon: "📝",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: formatTrend(weeklyTrends.submissionsChange).text,
      trendColor: formatTrend(weeklyTrends.submissionsChange).color
    },
    {
      title: "Karaniwang Marka",
      value: `${(kpiCalculations.averageScore || 0).toFixed(2)}%`,
      icon: "⭐",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      trend: formatTrend((weeklyTrends.averageScoreChange || 0), '%', true).text,
      trendColor: formatTrend((weeklyTrends.averageScoreChange || 0), '%', true).color
    }
  ], [kpiCalculations, weeklyTrends, formatTrend])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        {isLoadingUser ? (
          // Skeleton loader for welcome section
          <div className="animate-pulse">
            <div className="h-8 bg-blue-400 bg-opacity-50 rounded w-64 mb-2"></div>
            <div className="h-4 bg-blue-300 bg-opacity-50 rounded w-96"></div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">
              Maligayang pagbabalik, {currentUser?.first_name || 'Guro'}!
            </h1>
            <p className="text-blue-100">
              Narito ang nangyayari sa inyong mga kuwento at mag-aaral ngayon.
            </p>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Responsive layout: Single column on mobile, grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - KPIs and Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {isLoadingKPIs ? (
                // Skeleton loader for KPI cards
                kpiSkeletonLoader
              ) : (
                kpiData.map((kpi, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      </div>
                      <div className={`p-3 ${kpi.iconBg} rounded-full`}>
                        <div className={`w-6 h-6 ${kpi.iconColor}`}>{kpi.icon}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`text-xs ${kpi.trendColor} font-medium`}>
                        {kpi.trend}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Story Performance Chart */}
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                isStoryPerformanceOverflowing ? 'h-[500px] overflow-y-scroll' : 'h-fit'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagganap ng Kuwento</h3>
                <div ref={storyPerformanceContentRef} className="space-y-4">
                  {isLoadingStories ? (
                    // Skeleton loader for story performance
                    storyPerformanceSkeletonLoader
                  ) : (
                    limitedStories.map((story, index) => (
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
                              {story._count.Submissions} pagsusumite
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (story._count.Submissions / Math.max(kpiCalculations.totalSubmissions, 1)) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 font-medium min-w-0">
                              {story._count.QuizItems} aytem
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                isActivityOverflowing ? 'h-[500px] overflow-y-scroll' : 'h-fit'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kamakailang Aktibidad</h3>
                <div ref={activityContentRef} className="space-y-4">
                  {isLoadingNotifications ? (
                    // Skeleton loader for recent activity
                    recentActivitySkeletonLoader
                  ) : notifications.length > 0 ? (
                    limitedNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${getNotificationColor(notification.type)} rounded-full mt-2`}></div>
                        <div>
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500">{formatTimeElapsed(notification.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Walang kamakailang aktibidad</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Code Generator (Responsive) */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:sticky lg:top-6">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  Gumawa ng Access Code
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lumikha ng mga code para sa access ng mga estudyante
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 text-black">
                {/* Step 1: Choose a story */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Pumili ng Kuwento
                  </label>
                  <select
                    value={selectedStoryId || ''}
                    onChange={(e) => setSelectedStoryId(Number(e.target.value) || null)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pumili ng kuwento...</option>
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
                    2. Gumawa ng Code
                  </label>
                  <button
                    onClick={handleGenerateCode}
                    disabled={isLoading || !selectedStoryId}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gumagawa...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">⚡</span>
                        Gumawa ng Code
                      </>
                    )}
                  </button>
                </div>

                {/* Step 3: Share the code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Ibahagi ang Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={generatedCode}
                      readOnly
                      placeholder="Ang ginawang code ay lalabas dito"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none text-center font-mono font-bold"
                    />
                    {generatedCode && (
                      <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Kopyahin sa clipboard"
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
                          Code na-generate na! Ibahagi sa inyong mga estudyante.
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
