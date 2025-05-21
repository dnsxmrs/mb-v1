export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 text-gray-800">
            <div className="space-y-4 w-full max-w-md animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
        </div>
    );
}