import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import GuestHeader from "@/components/GuestHeader"
import GuestFooter from "@/components/GuestFooter"
import WordSearchGame from "@/components/WordSearchGame"
import { getWordSearches } from '@/actions/word-search'

interface PageProps {
    params: {
        id: string
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await params
        const result = await getWordSearches()
        
        if (result.success && result.data) {
            const wordSearch = result.data.find(ws => ws.id === parseInt(id))
            
            if (wordSearch) {
                return {
                    title: `${wordSearch.title} | Word Search | E-KWENTO`,
                    description: wordSearch.description || `Play the ${wordSearch.title} word search puzzle`,
                }
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
    }

    return {
        title: 'Word Search Game | E-KWENTO',
        description: 'Play an educational word search puzzle',
    }
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
    try {
        const result = await getWordSearches()
        
        if (result.success && result.data) {
            return result.data
                .filter(ws => ws.status === 'active')
                .map((wordSearch) => ({
                    id: wordSearch.id.toString(),
                }))
        }
    } catch (error) {
        console.error('Error generating static params:', error)
    }

    return []
}

export default async function WordSearchGamePage({ params }: PageProps) {
    const { id } = await params
    
    // Validate ID
    const wordSearchId = parseInt(id)
    if (isNaN(wordSearchId)) {
        notFound()
    }

    // Fetch word search data
    let wordSearch = null
    try {
        const result = await getWordSearches()
        
        if (result.success && result.data) {
            wordSearch = result.data.find(ws => 
                ws.id === wordSearchId && 
                ws.status === 'active' && 
                ws.deletedAt === null
            )
        }
    } catch (error) {
        console.error('Error fetching word search:', error)
    }

    // If word search not found, show 404
    if (!wordSearch) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            <GuestHeader />
            <div className="relative flex-1 bg-white">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
                        style={{ backgroundImage: 'url("/images/blue-bg.jpg")' }}
                    ></div>
                    <div className="absolute inset-0 bg-[#1E40AF] opacity-20 z-10"></div>
                </div>

                {/* Main Content */}
                <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 min-h-full">
                    <div className="max-w-6xl mx-auto">
                        <WordSearchGame wordSearch={wordSearch} />
                    </div>
                </main>
            </div>
            <GuestFooter />
        </div>
    )
}
