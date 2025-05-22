import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
    title: 'Login | Magandang Buhay!',
    description: 'Login to your account',
}

const LoginPage = () => {
    return (
        <div className="flex flex-col h-[85vh]">
            <div className="relative flex flex-col h-[85vh] bg-white">
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

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#60A5FA] opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"></div>
                    </div>

                    <LoginForm />
                </main>
            </div>
        </div>
    )
}

export default LoginPage
