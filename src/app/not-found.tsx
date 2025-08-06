import Link from 'next/link';
import GuestHeader from '@/components/GuestHeader';
import GuestFooter from '@/components/GuestFooter';

export default function NotFound() {
  return (
    <>
      <GuestHeader />
      <div className="flex flex-col h-[85vh]">
        <div className="relative flex flex-col h-[85vh] bg-white">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {/* Background image goes to the back */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
              style={{ backgroundImage: 'url("/images/blue-bg.webp")' }}
            ></div>

            {/* White overlay in front of the image */}
            <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#60A5FA] opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"></div>
            </div>

            {/* 404 Content */}
            <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-[#1E3A8A] mb-4 sm:mb-6">
                404
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E40AF] mb-6 sm:mb-8">
                Page Not Found
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#1E40AF] mb-8 sm:mb-12 max-w-2xl mx-auto">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
              </p>
              <Link
                href="/"
                className="inline-block bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-sm sm:text-base font-medium rounded-lg px-6 sm:px-8 py-3 sm:py-4 transition duration-200 shadow-sm"
              >
                Return Home
              </Link>
            </div>
          </main>
        </div>
      </div>
      <GuestFooter />
    </>
  );
}