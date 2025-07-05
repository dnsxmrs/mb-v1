import GuestHeader from '@/components/GuestHeader'
import GuestFooter from '@/components/GuestFooter'
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