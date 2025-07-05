'use client'

import { useState, useEffect } from 'react'
import { getSystemConfig } from '@/actions/system-config'

interface SystemConfig {
    id: number
    defaultChoicesCount: number
    maxChoicesCount: number
    minChoicesCount: number
    createdAt: Date
    updatedAt: Date
}

export function useSystemConfig() {
    const [config, setConfig] = useState<SystemConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchConfig = async () => {
        try {
            setLoading(true)
            const result = await getSystemConfig()
            if (result.success && result.data) {
                setConfig(result.data)
                setError(null)
            } else {
                setError(result.error || 'Failed to fetch system configuration')
            }
        } catch {
            setError('An error occurred while fetching system configuration')
        } finally {
            // setLoading(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    return {
        config,
        loading,
        error,
        refetch: fetchConfig
    }
}
