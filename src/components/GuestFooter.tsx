export default function GuestFooter() {
    return (
        <footer className="flex flex-col">
            <div className="bg-[#DBEAFE] backdrop-blur-sm text-[#1E3A8A] py-3 sm:py-4 mt-auto" >
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <p className="text-xs sm:text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} Magandang Buhay.
                        All rights reserved.
                    </p>

                    <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                        <div>
                            <span className="text-xs sm:text-sm">Contact us at: </span>
                            <a
                                href="mailto:valerieannesangalang14@gmail.com"
                                className="text-xs sm:text-sm hover:text-[#60A5FA] transition-colors duration-200"
                        >
                            valerieannesangalang14@gmail.com
                        </a>
                        </div>
                        <a
                            href="#"
                            className="hover:text-[#60A5FA] transition-colors duration-200"
                            aria-label="Facebook"
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-7H8v-2.88h2.44V9.41c0-2.4 1.43-3.74 3.61-3.74 1.05 0 2.14.19 2.14.19v2.35h-1.21c-1.2 0-1.57.75-1.57 1.52v1.82H17l-.32 2.88h-2.22v7C18.34 21.13 22 17 22 12z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="hover:text-[#60A5FA] transition-colors duration-200"
                            aria-label="Twitter"
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M22.46 6c-.77.35-1.6.59-2.46.7a4.28 4.28 0 001.88-2.37 8.59 8.59 0 01-2.71 1.04 4.26 4.26 0 00-7.32 3.88A12.1 12.1 0 013 4.9a4.25 4.25 0 001.32 5.68 4.22 4.22 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.18 4.29 4.29 0 01-1.93.07 4.27 4.27 0 003.98 2.96 8.55 8.55 0 01-6.3 1.76A12.07 12.07 0 0012 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.35 8.35 0 0024 6.4a8.38 8.38 0 01-2.54.7z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer >
    );
}
