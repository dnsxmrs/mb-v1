'use client';

import { useEffect, useCallback } from 'react';
import { refreshStudentSession } from '@/actions/student';

/**
 * Custom hook to automatically refresh student session on interactions
 *  
 * This should be used in student-facing components to extend session expiration
 */
export function useStudentSessionRefresh() {
    const refreshSession = useCallback(async () => {
        try {
            await refreshStudentSession();
            // Silent refresh - no need to show success message
        } catch (error) {
            console.error('Failed to refresh student session:', error);
            // Silent failure - we don't want to interrupt user experience
        }
    }, []);

    // Refresh session when component mounts
    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    // Return the refresh function so components can manually call it on specific interactions
    return { refreshSession };
}

/**
 * Higher-order function to wrap event handlers with session refresh
 *  
 * Usage: onClick={withSessionRefresh(() => handleSomeAction())}
 */
export function withSessionRefresh<T extends (...args: unknown[]) => unknown>(handler: T): T {
    return (async (...args: unknown[]) => {
        // Refresh session before executing the handler
        try {
            await refreshStudentSession();
        } catch (error) {
            console.error('Failed to refresh session before interaction:', error);
        }

        // Execute the original handler
        return handler(...args);
    }) as T;
}
