import type { Metadata } from "next";
import { Poppins } from 'next/font/google'
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { ClerkProvider } from "@clerk/nextjs";
import GuestHeader from "@/components/GuestHeader";
import GuestFooter from "@/components/GuestFooter";
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Choose weights you need
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Magandang Buhay!",
  description:
    "A fun and enriching reading and quiz app crafted by educators to empower students with knowledge, critical thinking, and a love for learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    >
      <html lang="en" className={poppins.className}>
        <body
          className={`${poppins.variable} antialiased`}
        >
          <GuestHeader />
          {children}
          <Toaster position="top-center" />
          <GuestFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
