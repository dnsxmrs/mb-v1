"use client";

import { useState } from "react";
import { handleStudentInfoSubmit } from "./actions";

interface StudentInfoFormProps {
  code: string;
}

export default function StudentInfoForm({ code }: StudentInfoFormProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-6 text-center">
        Magbigay ng Impormasyon
      </h1>
      
      <form action={(formData) => handleStudentInfoSubmit(formData, code)} className="space-y-6">
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

        <button
          type="submit"
          disabled={!isChecked}
          className={`w-full font-medium rounded-lg px-6 py-3 transition duration-200 shadow-sm ${
            isChecked 
              ? "bg-[#3B82F6] hover:bg-[#60A5FA] text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Magpatuloy
        </button>
      </form>
    </div>
  );
} 