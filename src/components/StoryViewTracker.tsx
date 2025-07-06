'use client'

import { useEffect } from 'react'
import { trackStoryView } from '@/actions/story-view'

interface StoryViewTrackerProps {
  code: string
}

/**
 * Client component that tracks story views non-blocking when mounted
 * This should be included in story pages to automatically track views
 */
export default function StoryViewTracker({ code }: StoryViewTrackerProps) {
  useEffect(() => {
    // Track the story view asynchronously without blocking the UI
    const track = async () => {
      try {
        await trackStoryView(code)
        // Silent success - no need to show anything to user
      } catch (error) {
        // Silent failure - we don't want to interrupt user experience
        console.warn('Failed to track story view:', error)
      }
    }

    // Small delay to ensure the page has fully loaded
    const timeoutId = setTimeout(track, 500)

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeoutId)
  }, [code])

  // This component renders nothing - it's just for tracking
  return null
}
