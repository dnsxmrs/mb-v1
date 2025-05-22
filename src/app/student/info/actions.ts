"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleStudentInfoSubmit(formData: FormData, code: string) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;

  if (!name || !section) {
    return;
  }

  // Store student info in cookies
  (await cookies()).set("student_info", JSON.stringify({ name, section }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // set the privacy consent to true
  (await cookies()).set("privacy_consent", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect(`/student/story/${code}`);
} 