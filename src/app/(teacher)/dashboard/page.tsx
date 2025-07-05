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
      // setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main dashboard content */}
      <section className="flex-1">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-lg mx-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Generate Access Code for Your Students
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 text-black">
            {/* Step 1: Choose a story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Choose a story - Select a story from the dropdown below.
              </label>
              <select
                value={selectedStoryId || ''}
                onChange={(e) => setSelectedStoryId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select the story...</option>
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
                2. Generate code - Click the button to create a unique access code.
              </label>
              <button
                onClick={handleGenerateCode}
                disabled={isLoading || !selectedStoryId}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate a code
                    <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Step 3: Share the code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. Share the code - Copy the code and send it to your students so they can access the story.
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generatedCode}
                  readOnly
                  placeholder="Generated code will appear here"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none"
                />
                {generatedCode && (
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Copy to clipboard"
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success message */}
            {generatedCode && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Access code generated successfully! Share this code with your students.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
