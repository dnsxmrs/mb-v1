// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentInfoForm from "./StudentInfoForm";
import { env } from "process";

export default async function StudentInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const code = (await searchParams).code

  if (env.NODE_ENV === "development") {
    console.log("Type of searchParams", typeof searchParams);
    console.log("code", code);
  }

  if (!code) {
    redirect("/");
  }
  // removed this for instance of users sharing a device
  // if (hasConsent) {
  //   redirect(`/student/story/${searchParams.code}`);
  // }

  return (
    <div className="h-[85vh] flex items-center justify-center p-4">
      <StudentInfoForm code={code.toString()} />
    </div>
  );
}

