'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleStudentInfoSubmit(formData: FormData, code: string) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;

  if (!name || !section) return;

  const cookieStore = cookies();

  cookieStore.set("student_info", JSON.stringify({ name, section }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
  });

  cookieStore.set("privacy_consent", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/student/story/${code}`);
}