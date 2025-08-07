import StoryList from '@/components/StoryList'
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mga Kwento | E-KWENTO",
    description: "Mga kwento para sa mga guro upang pamahalaan ang kanilang mga kwento at estudyante",
};

//  Story management dashboard for teachers
export default function StoryManagement() {
    return (
        <div className="container mx-auto px-4 py-8">
            <StoryList />
        </div>
    )
}
