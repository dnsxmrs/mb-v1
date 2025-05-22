// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentInfoForm from "./StudentInfoForm";
import { env } from "process";

export default async function StudentInfoPage({
  searchParams
}: {
  searchParams: { code: string }
}) {
  const code = searchParams.code;

  if (env.NODE_ENV === "development") {
    console.log("Type of searchParams", typeof searchParams);
    console.log("Code value:", code);
  }

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

