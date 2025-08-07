import StudentLogClient from '@/components/StudentLogClient'
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Talaan | E-KWENTO",
    description: "Mga kwento para sa mga guro upang pamahalaan ang kanilang mga kwento at estudyante",
};

export default function StudentLogPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <StudentLogClient />
        </div>
    )
}


