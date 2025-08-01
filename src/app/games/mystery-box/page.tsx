import GuestHeader from "@/components/GuestHeader";
import GuestFooter from "@/components/GuestFooter";
import MysteryBoxGame from "@/components/MysteryBoxGame";
import { getMysteryBoxItems, type MysteryBoxItem } from "@/actions/mystery-box";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Mystery Box | E-KWENTO',
    description: 'Explore our collection of educational games',
}

export default async function MysteryBoxPage() {
    const result = await getMysteryBoxItems()
    const mysteryBoxData = result.success ? result.data : []

    // Map the data to match the component interface
    const mysteryBoxItems: MysteryBoxItem[] = mysteryBoxData.map(item => ({
        id: item.id,
        word: item.word,
        description: item.description,
        imageUrl: item.imageUrl,
        status: item.status as 'active' | 'inactive'
    }))

    return (
        <div className="flex flex-col min-h-screen">
            <GuestHeader />
            <div className="relative flex-1 bg-white">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    {/* Background image goes to the back */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
                        style={{ backgroundImage: 'url("/images/blue-bg.jpg")' }}
                    ></div>

                    {/* Purple overlay in front of the image */}
                    <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
                </div>

                {/* Main Content */}
                <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 min-h-full">
                    <div className="max-w-7xl mx-auto">
                        <MysteryBoxGame mysteryBoxItems={mysteryBoxItems} />
                    </div>
                </main>
            </div>
            <GuestFooter />
        </div>
    );
}