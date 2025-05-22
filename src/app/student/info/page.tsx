import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
import StudentInfoForm from "./StudentInfoForm";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function StudentInfo({ searchParams }: PageProps) {
  // const cookieStore = await cookies();
  // const hasConsent = cookieStore.get("privacy_consent");

  const code = searchParams?.code;

  if (!code || Array.isArray(code)) {
    redirect("/");
  }

  // removed this for instance of users sharing a device
  // if (hasConsent) {
  //   redirect(`/student/story/${searchParams.code}`);
  // }

  return (
    <div className="h-[85vh] flex items-center justify-center p-4">
      <StudentInfoForm code={code} />
    </div>
  );
}
