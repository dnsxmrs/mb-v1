import GuestHeader from "@/components/GuestHeader";
import GuestFooter from "@/components/GuestFooter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Privacy Policy | Magandang Buhay!',
  description: 'Learn about our privacy practices',
}

export default function PrivacyNotice() {
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

        {/* Main Content */}
        <main className="flex-grow relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#1E3A8A]">Data Privacy Notice for Users</h1>
              <p className="text-gray-600 mt-2">Effective Date: May 2025</p>
            </div>

            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 mb-6">
                We value and respect your privacy. In compliance with the Data Privacy Act of 2012, 
                we are committed to ensuring that your personal data is collected, processed, and 
                stored securely and used solely for lawful and legitimate educational purposes.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">1. Data Collected</h2>
                <p className="text-gray-700 mb-4">
                  The following data will be collected from you upon your use of this system:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Your Name</li>
                  <li>Your Section</li>
                  <li>Your Consent to this Data Privacy Notice</li>
                  <li>Your Answers to module-based quizzes and lessons</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">2. Purpose of Collection</h2>
                <p className="text-gray-700 mb-4">
                  Your data will be used exclusively for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>To record and track your learning progress</li>
                  <li>To allow your teachers to access and evaluate your responses for educational purposes</li>
                  <li>To store quiz results and support academic record-keeping</li>
                  <li>To help us improve learning materials and performance tracking features</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">3. Data Storage and Protection</h2>
                <p className="text-gray-700 mb-4">
                  Your personal data will be:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Stored in a secure, encrypted database</li>
                  <li>Accessed only by authorized personnel (e.g., your teachers and system administrators)</li>
                  <li>Not shared with third parties or used for any commercial purposes</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  We implement strict technical and organizational measures to protect your data against 
                  unauthorized access, loss, or misuse.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">4. Your Rights</h2>
                <p className="text-gray-700 mb-4">
                  As a data subject (and with consent from your parent/guardian, if applicable), 
                  you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Be informed about how your data is used</li>
                  <li>Access your personal information upon request</li>
                  <li>Object to or request correction of inaccurate data</li>
                  <li>Withdraw consent at any time, subject to legal and academic considerations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">5. Consent</h2>
                <p className="text-gray-700 mb-4">
                  By clicking &quot;Sumasang-ayon ako&quot; (I Agree), you confirm that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>You have read and understood this Data Privacy Notice</li>
                  <li>You voluntarily give your consent to the collection and processing of your personal data</li>
                  <li>You are aware that this consent is required before you can continue using this educational system</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-[#1E3A8A] mb-4">Contact Information</h2>
                <p className="text-gray-700">
                  For any questions or concerns regarding your data, you may contact our Data Protection Officer at:
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p>Email: valerieannesangalang14@gmail.com</p>
                  <p>Contact Number: (02) XXX-XXXX</p>
                  <p>Office Address: Bestlink College of the Philippines</p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      <GuestFooter />
    </div>
  );
} 