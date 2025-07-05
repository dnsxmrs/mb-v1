import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentInfoForm from "./StudentInfoForm";
import { env } from "process";
import { handleCodeSubmit } from "@/actions/code";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Student Information | Magandang Buhay!',
  description: 'Provide your information',
}

interface StudentData {
  name?: string;
  section?: string;
  hasConsent?: boolean;
}

export default async function StudentInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const code = (await searchParams).code

  // create FormData and append code
  const formData = new FormData();
  formData.append('code', Array.isArray(code) ? code[0] ?? '' : code ?? '');

  // use the handleCodeSubmit action to validate the code
  const result = await handleCodeSubmit(formData);

  // reverse the logic here if the code is invalid or not provided then redirect back to home
  if (!result.success || !result.redirectTo || !code) {
    redirect("/");
  }

  // Check for existing student session data
  const cookieStore = await cookies();
  const studentInfoCookie = cookieStore.get("student_info");
  const privacyConsentCookie = cookieStore.get("privacy_consent");

  let existingStudentData: StudentData = {};

  if (studentInfoCookie) {
    try {
      const parsedData = JSON.parse(studentInfoCookie.value);
      existingStudentData = {
        name: parsedData.name || '',
        section: parsedData.section || '',
      };
    } catch (error) {
      console.error('Error parsing student info cookie:', error);
    }
  }

  if (privacyConsentCookie && privacyConsentCookie.value === 'true') {
    existingStudentData.hasConsent = true;
  }

  if (env.NODE_ENV === "development") {
    console.log("Type of searchParams", typeof searchParams);
    console.log("code", code);
    console.log("formData", formData);
    console.log("result", result);
    console.log("existingStudentData", existingStudentData);
  }

  // removed this for instance of users sharing a device (they have to input their info every time)
  // if (hasConsent) {
  //   redirect(`/student/story/${searchParams.code}`);
  // }

  return (
    <div className="h-[85vh] flex items-center justify-center p-4">
      <StudentInfoForm
        code={code.toString()}
        initialData={existingStudentData}
      />
    </div>
  );
}

