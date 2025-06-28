import type { Metadata } from "next";
import TeacherNav from './components/TeacherNav'

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Dashboard for students to manage their courses and assignments",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TeacherNav>{children}</TeacherNav>
}