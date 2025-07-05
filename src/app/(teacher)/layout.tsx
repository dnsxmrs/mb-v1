import type { Metadata } from "next";
import TeacherNav from './TeacherNav'

export const metadata: Metadata = {
  title: "Teacher Module",
  description: "Dashboard for teachers to manage their stories and students",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TeacherNav>{children}</TeacherNav>
}