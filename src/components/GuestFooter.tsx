import Link from "next/link";

export default function GuestFooter() {
    return (
        <footer className="bg-[#DBEAFE] backdrop-blur-sm text-[#1E3A8A] py-2 xs:py-3 sm:py-4 mt-auto">
            <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between space-y-2 xs:space-y-3 sm:space-y-0">
                <div className="text-xs xs:text-sm text-center sm:text-left order-2 sm:order-1">
                    <strong>&copy;</strong>{' '}{new Date().getFullYear()} E-KWENTO.
                    Lahat ng karapatan ay nakalaan. &nbsp; Ang aming Pahayag ng Pagkapribado
                    <Link href="/privacy-notice" className="underline ml-1 hover:text-[#60A5FA] transition-colors duration-200">
                        dito
                    </Link>
                    .
                </div>

                <div className="text-xs xs:text-sm text-center sm:text-right order-1 sm:order-2 mb-2 sm:mb-0">
                    Makipag-ugnayan sa amin sa:
                    <a
                        href="mailto:ekwento2025@gmail.com"
                        className="ml-1 hover:text-[#60A5FA] transition-colors duration-200 break-all xs:break-normal"
                    >
                        ekwento2025@gmail.com
                    </a>
                </div>
            </div>
        </footer>
    );
}
