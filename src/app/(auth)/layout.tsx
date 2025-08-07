import GuestHeader from '@/components/GuestHeader'
import GuestFooter from '@/components/GuestFooter'
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Login | E-KWENTO",
    description: "Login page for E-KWENTO",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <GuestHeader />
            {children}
            <GuestFooter />
        </>
    )
}