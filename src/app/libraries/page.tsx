import GuestHeader from "@/components/GuestHeader";
import GuestFooter from "@/components/GuestFooter";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Libraries | Magandang Buhay!',
    description: 'Explore our collection of educational libraries',
}

export default function Libraries() {
    return (
        <div className="flex flex-col min-h-screen">
            <GuestHeader />
            <div className="relative flex flex-col min-h-screen bg-white">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    {/* Background image goes to the back */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
                        style={{ backgroundImage: 'url("/images/blue-bg.jpg")' }}
                    ></div>

                    {/* White overlay in front of the image */}
                    <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
                </div>

                {/* Main Content */}
                <main className="flex-grow relative z-10 py-12 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-[#1E3A8A]">Libraries are coming soon!</h1>
                    <p className="text-gray-600 mt-2">Stay tuned for updates.</p>
                </main>
            </div>
            <GuestFooter />
        </div>
    );
}