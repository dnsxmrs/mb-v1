// import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentInfoForm from "./StudentInfoForm";
import { env } from "process";

type tParams = Promise<{ code: string }>;

export default async function StudentInfoPage({
  params,
  searchParams
}: {
  params: tParams;
  searchParams: { code: string }
}) {
  const { code: paramsCode } = await params;
  const searchParamsCode =  await searchParams.code;

  if (env.NODE_ENV === "development") {
    console.log("Type of params", typeof params);
    console.log("Type of searchParams", typeof searchParams);
    console.log("paramsCode:", paramsCode);
    console.log("searchParamsCode:", searchParamsCode);
  }

  const code = paramsCode || searchParamsCode;

  if (!code) {
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

