import GuestFooter from "@/components/GuestFooter";
import GuestHeader from "@/components/GuestHeader";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  async function handleSubmit(formData: FormData) {
    'use server'
    const code = formData.get('code') as string;

    // Mock validation - in real app, validate against database
    if (code && code.length >= 4) {
      redirect(`/student/info?code=${code}`);
    }
  }

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

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-20 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#60A5FA] opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E40AF] mb-6 sm:mb-8 leading-snug">
                Kuwento at Kaalaman
                <br />
                Para sa Kabataang Pilipino
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-[#1E40AF] mb-8 sm:mb-12 max-w-2xl">
                Tuklasin ang mga kuwento at kaalaman na magbibigay-inspirasyon sa mga kabataang Pilipino na matuto at lumago.
              </p>

              {/* Code Input Section */}
              <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-[#DBEAFE] w-full max-w-md">
                <h3 className="text-lg sm:text-xl font-semibold text-[#1E3A8A] mb-4">Magsimula na ng Pag-aaral</h3>
                <form action={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="code"
                      placeholder="Ilagay ang iyong code dito"
                      className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-[#1E3A8A] text-center bg-[#DBEAFE]/80 backdrop-blur-sm placeholder:text-[#60A5FA] border border-[#3B82F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] shadow-sm text-sm sm:text-base"
                      required
                      minLength={4}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 transition duration-200 shadow-sm"
                  >
                    I-submit ang Code
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 bg-[#DBEAFE]/20 rounded-full blur-3xl"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* use next image */}
                  <Image
                    src="/images/books.svg"
                    alt="Pile of books"
                    width={500}
                    height={500}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="relative z-10 max-w-4xl mx-auto w-full mt-16 sm:mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">
              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-[#DBEAFE]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#DBEAFE]/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#1E3A8A] mb-2">Kalidad na Nilalaman</h3>
                <p className="text-sm sm:text-base text-[#3B82F6]">Magkaroon ng access sa iba&apos;t ibang kuwento at materyales pang-edukasyon</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-[#DBEAFE]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#DBEAFE]/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#1E3A8A] mb-2">Pamayanan</h3>
                <p className="text-sm sm:text-base text-[#3B82F6]">Sumali sa isang pamayanan ng mga mag-aaral at guro</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-[#DBEAFE] sm:col-span-2 md:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#DBEAFE]/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#1E3A8A] mb-2">Mabilis na Access</h3>
                <p className="text-sm sm:text-base text-[#3B82F6]">Kumuha ng instant access sa mga materyales sa pag-aaral gamit ang iyong code</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <GuestFooter />
    </div>
  );
}
