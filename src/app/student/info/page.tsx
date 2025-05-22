import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
import StudentInfoForm from "./StudentInfoForm";

export default async function StudentInfo({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // const cookieStore = await cookies();
  // const hasConsent = cookieStore.get("privacy_consent");

  if (!searchParams.code) {
    redirect("/");
  }

  // removed this for instance of users sharing a device
  // if (hasConsent) {
  //   redirect(`/student/story/${searchParams.code}`);
  // }

  return (
    <div className="h-[85vh] flex items-center justify-center p-4">
      <StudentInfoForm code={searchParams.code as string} />
    </div>
  );
} 