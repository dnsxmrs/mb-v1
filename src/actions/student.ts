// src/actions/student.ts
'use server';

import { cookies } from "next/headers";
import { trackStoryView } from "./story-view";

export async function handleStudentInfoSubmit(formData: FormData, code: string) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;

  if (!name || !section) return { success: false, error: "Pakiusap, punan ang lahat ng kinakailangang impormasyon." };

  if (name.length < 2 || section.length < 2) {
    return { success: false, error: "Ang pangalan at seksyon ay dapat hindi bababa sa 2 karakter." };
  }

  const cookieStore = cookies();

  // Check if deviceId already exists in cookies, if not generate a new one
  let deviceId: string;
  const existingStudentInfo = (await cookieStore).get("student_info");

  if (existingStudentInfo) {
    try {
      const parsedInfo = JSON.parse(existingStudentInfo.value);
      deviceId = parsedInfo.deviceId || crypto.randomUUID();
    } catch {
      // If parsing fails, generate new deviceId
      deviceId = crypto.randomUUID();
    }
  } else {
    // No existing cookie, generate new deviceId
    deviceId = crypto.randomUUID();
  }

  (await cookieStore).set("student_info", JSON.stringify({ name, section, deviceId }), {
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

  // instead of setting authorized code, let's just add a view story entry using the code
  await trackStoryView(code.toUpperCase(), name, section, deviceId);

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

// Function to get current student info from session
export async function getCurrentStudentInfo() {
  try {
    const cookieStore = await cookies();
    const studentInfoCookie = cookieStore.get("student_info");
    const privacyConsentCookie = cookieStore.get("privacy_consent");

    if (!studentInfoCookie || !privacyConsentCookie) {
      return { success: false, error: "No active student session found" };
    }

    // Parse student info
    const studentInfo = JSON.parse(studentInfoCookie.value);

    return {
      success: true,
      data: {
        name: studentInfo.name || '',
        section: studentInfo.section || '',
        deviceId: studentInfo.deviceId || crypto.randomUUID(),
        authorizedCode: studentInfo.authorizedCode || '',
        time: studentInfo.time || new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error getting current student info:', error);
    return { success: false, error: "Failed to get student info" };
  }
}