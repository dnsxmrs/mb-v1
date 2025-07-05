import GuestHeader from '@/components/GuestHeader'
import GuestFooter from '@/components/GuestFooter'
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Student",
    description: "Dashboard for students to manage their courses and assignments",
};

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <GuestHeader />
            <div className="relative flex flex-col flex-grow bg-white">
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
                <main className="flex-grow relative z-10 min-h-0">
                    {children}
                </main>
            </div>
            <GuestFooter />
        </div>
    )
}