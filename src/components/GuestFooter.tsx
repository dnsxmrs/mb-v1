export default function GuestFooter() {
    return (
        <footer className="flex flex-col">
            <div className="bg-[#DBEAFE] backdrop-blur-sm text-[#1E3A8A] py-2 xs:py-3 sm:py-4 mt-auto" >
                <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between space-y-2 xs:space-y-3 sm:space-y-0">
                    <p className="text-xs xs:text-sm text-center sm:text-left order-2 sm:order-1">
                        &copy; {new Date().getFullYear()} Magandang Buhay.
                        All rights reserved.
                    </p>

                    <div className="flex items-center justify-center order-1 sm:order-2">
                        <div className="text-center sm:text-right">
                            <span className="text-xs xs:text-sm block xs:inline">Contact us at: </span>
                            <a
                                href="mailto:valerieannesangalang14@gmail.com"
                                className="text-xs xs:text-sm hover:text-[#60A5FA] transition-colors duration-200 break-all xs:break-normal"
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
