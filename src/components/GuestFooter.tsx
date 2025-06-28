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
                    </div>
                </div>
            </div>
        </footer >
    );
}
