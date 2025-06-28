'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoadingLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export default function LoadingLink({ href, children, className = "" }: LoadingLinkProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        router.push(href);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} flex items-center justify-center gap-2`}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {children}
        </button>
    );
}
