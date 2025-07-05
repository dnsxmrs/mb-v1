// src/actions/student.ts
'use server';

import { cookies } from "next/headers";

export async function handleStudentInfoSubmit(formData: FormData, code: string) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;

  if (!name || !section) return { success: false, error: "Pakiusap, punan ang lahat ng kinakailangang impormasyon." };

  if (name.length < 2 || section.length < 2) {
    return { success: false, error: "Ang pangalan at seksyon ay dapat hindi bababa sa 2 karakter." };
  }

  const cookieStore = cookies();

  (await cookieStore).set("student_info", JSON.stringify({ name, section, authorizedCode: code }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  (await cookieStore).set("privacy_consent", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true, redirectTo: `/student/story/${code}` };
}