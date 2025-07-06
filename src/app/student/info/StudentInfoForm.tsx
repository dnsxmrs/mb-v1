"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleStudentInfoSubmit } from "../../../actions/student";
import { useStudentSessionRefresh } from "@/hooks/useStudentSession";

interface StudentInfoFormProps {
  code: string;
  initialData?: {
    name?: string;
    section?: string;
    hasConsent?: boolean;
  };
}

export default function StudentInfoForm({ code, initialData }: StudentInfoFormProps) {
  const [isChecked, setIsChecked] = useState(initialData?.hasConsent || false);
  const [clientError, setClientError] = useState('')
  const [name, setName] = useState(initialData?.name || '')
  const [section, setSection] = useState(initialData?.section || '')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Add session refresh functionality
  const { refreshSession } = useStudentSessionRefresh();

  // No need for useEffect to read cookies since we get the data from props
  // The server-side page component handles cookie reading and passes the data

  async function handleFormAction() {
    // Refresh session before form submission
    await refreshSession();

    setClientError('')
    setIsLoading(true)

    try {
      // Use state values instead of formData for validation and submission
      if (!name || !section) {
        setClientError('Pakiusap, punan ang lahat ng kinakailangang impormasyon.');
        return;
      }

      // Create new FormData with current state values
      const submissionFormData = new FormData();
      submissionFormData.append('name', name);
      submissionFormData.append('section', section);

      const result = await handleStudentInfoSubmit(submissionFormData, code);

      if (result.success && result.redirectTo) {
        router.push(`/student/story/${code}`);
      } else if (result.error) {
        setClientError(result.error);
      }
    } catch (error) {
      setClientError('Nagkaroon ng error. Subukan ulit.');
      console.error('Form submission error:', error);
    } finally {
      // setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] mb-6 text-center">
        Ano ang iyong pangalan at seksyon?
      </h1>

      {clientError && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{clientError}</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleFormAction(); }} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Pangalan
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA]"
            placeholder="Ilagay ang iyong pangalan"
          />
        </div>

        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
            Seksyon
          </label>
          <input
            type="text"
            id="section"
            name="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA]"
            placeholder="Ilagay ang iyong seksyon"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="privacy"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="h-4 w-4 text-[#3B82F6] focus:ring-[#60A5FA] border-gray-300 rounded"
          />
          <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
            I have read and agree to the <a href="/privacy-statement" className="text-[#3B82F6] hover:text-[#60A5FA] underline" target="_blank">Privacy Notice</a>
          </label>
        </div>

        {/*  use the submitbutton and pass the ischecked */}
        <button
          type="submit"
          disabled={isLoading || !isChecked}
          className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 transition duration-200 shadow-sm flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Magpatuloy...
            </div>
          ) : (
            'Magpatuloy'
          )}
        </button>
      </form>
    </div>
  );
}