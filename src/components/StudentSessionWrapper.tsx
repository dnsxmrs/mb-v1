'use client';

import { ReactNode } from 'react';
import { useStudentSessionRefresh } from '@/hooks/useStudentSession';

interface StudentSessionWrapperProps {
    children: ReactNode;
}

/**
 * Wrapper component for student pages that automatically handles session refresh
 * This component should wrap all student-facing pages to ensure sessions stay active
 */
export default function StudentSessionWrapper({ children }: StudentSessionWrapperProps) {
    // This will automatically refresh the session when the component mounts
    // and provides refresh functionality for child components
    useStudentSessionRefresh();

    return <>{children}</>;
}
