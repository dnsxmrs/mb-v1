'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingLink from './LoadingLink';

interface UnauthorizedRedirectProps {
    authorizedCode: string;
}

export default function UnauthorizedRedirect({ authorizedCode }: UnauthorizedRedirectProps) {
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.push(`/student/story/${authorizedCode}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [authorizedCode, router]);

    return (
        <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Unauthorized Access</h1>
            <p className="text-gray-500 mb-6 text-center">
                You can only access the story you were originally assigned. Redirecting you back in {countdown} seconds...
            </p>
            <LoadingLink
                href={`/student/story/${authorizedCode}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
                Go to your assigned story
            </LoadingLink>
        </div>
    );
}
