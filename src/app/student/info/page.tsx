// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentInfoForm from "./StudentInfoForm";
import { env } from "process";
import { handleCodeSubmit } from "@/actions/code";

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

  if (env.NODE_ENV === "development") {
    console.log("Type of searchParams", typeof searchParams);
    console.log("code", code);
    console.log("formData", formData);
    console.log("result", result);
  }

  // removed this for instance of users sharing a device (they have to input their info every time)
  // if (hasConsent) {
  //   redirect(`/student/story/${searchParams.code}`);
  // }

  return (
    <div className="h-[85vh] flex items-center justify-center p-4">
      <StudentInfoForm code={code.toString()} />
    </div>
  );
}

