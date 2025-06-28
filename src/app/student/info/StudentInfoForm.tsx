"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { handleStudentInfoSubmit } from "../../../actions/student";

interface StudentInfoFormProps {
  code: string;
}

// Submit button component that uses useFormStatus
// This button will be disabled if the checkbox is not checked
function SubmitButton({ isChecked }: { isChecked: boolean }) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            // set back to disabled if pending or checkbox is not checked or if the formstatus changes
            // this will prevent the user from submitting the form if the checkbox is not checked
            // or if the form is pending
            // or if the form is done processing
            disabled={pending || !isChecked}
            className="w-full bg-[#3B82F6] hover:bg-[#60A5FA] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 transition duration-200 shadow-sm flex items-center justify-center"
        >
            {pending ? (
              // add a loading spinner
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Magpatuloy...
              </div>
            ) : (
                'Magpatuloy'
            )}
        </button>
    )
}

export default function StudentInfoForm({ code }: StudentInfoFormProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [clientError, setClientError] = useState('')
  const router = useRouter()

  async function handleFormAction(formData: FormData) {
    setClientError('')

    const name = formData.get("name") as string;
    const section = formData.get("section") as string;
    if (!name || !section) {
      setClientError('Pakiusap, punan ang lahat ng kinakailangang impormasyon.');
      return;
    }

    const result = await handleStudentInfoSubmit(formData, code);

    if (result.success && result.redirectTo) {
      router.push(`/student/story/${code}`);
    } else if (result.error) {
      setClientError(result.error);
    }
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-6 text-center">
        Magbigay ng Impormasyon
      </h1>

      {clientError && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{clientError}</p>
        </div>
      )}

      <form action={handleFormAction} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Pangalan
          </label>
          <input
            type="text"
            id="name"
            name="name"
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

        <SubmitButton isChecked={isChecked} />
      </form>
    </div>
  );
}