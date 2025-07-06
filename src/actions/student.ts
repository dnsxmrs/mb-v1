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

// New function to refresh student session
export async function refreshStudentSession() {
  try {
    const cookieStore = await cookies();
    const studentInfoCookie = cookieStore.get("student_info");
    const privacyConsentCookie = cookieStore.get("privacy_consent");

    if (!studentInfoCookie || !privacyConsentCookie) {
      return { success: false, error: "No active student session found" };
    }

    // Parse existing student info
    const studentInfo = JSON.parse(studentInfoCookie.value);

    // Refresh cookies with new expiration date (30 days from now)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    // Reset the student_info cookie with extended expiration
    cookieStore.set("student_info", JSON.stringify(studentInfo), cookieOptions);

    // Reset the privacy_consent cookie with extended expiration
    cookieStore.set("privacy_consent", "true", cookieOptions);

    return { success: true, message: "Session refreshed successfully" };
  } catch (error) {
    console.error('Error refreshing student session:', error);
    return { success: false, error: "Failed to refresh session" };
  }
}

// Function to update the authorized code in student session
export async function updateStudentAuthorizedCode(newCode: string) {
  try {
    const cookieStore = await cookies();
    const studentInfoCookie = cookieStore.get("student_info");
    const privacyConsentCookie = cookieStore.get("privacy_consent");

    if (!studentInfoCookie || !privacyConsentCookie) {
      return { success: false, error: "No active student session found" };
    }

    // Parse existing student info
    const studentInfo = JSON.parse(studentInfoCookie.value);

    // Update the authorized code
    const updatedStudentInfo = {
      ...studentInfo,
      authorizedCode: newCode.toUpperCase()
    };

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    // Update the student_info cookie with new authorized code
    cookieStore.set("student_info", JSON.stringify(updatedStudentInfo), cookieOptions);

    return { success: true, message: "Authorized code updated successfully" };
  } catch (error) {
    console.error('Error updating authorized code:', error);
    return { success: false, error: "Failed to update authorized code" };
  }
}