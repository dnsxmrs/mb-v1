'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedRedirect() {
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    // Handle navigation when countdown reaches zero
    useEffect(() => {
        if (countdown === 0) {
            console.log('Countdown reached 0, going back...');
            router.back();
        }
    }, [countdown, router]);

    // Handle countdown timer
    useEffect(() => {
        console.log('Starting countdown timer');
        const interval = setInterval(() => {
            setCountdown((prev) => {
                console.log('Countdown:', prev);
                if (prev <= 1) {
                    console.log('Clearing interval');
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            console.log('Cleanup: clearing interval');
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Unauthorized Access</h1>
            <p className="text-gray-500 mb-6 text-center">
                You can only access the story you were originally assigned. Taking you back in {countdown} seconds...
            </p>
            <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
                Go Back
            </button>
        </div>
    );
}
