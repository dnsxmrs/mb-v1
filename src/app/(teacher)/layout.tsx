import TeacherNav from './TeacherNav'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ulatan ng Guro | E-KWENTO",
  description: "Ulatan para sa mga guro upang pamahalaan ang kanilang mga kwento at estudyante",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TeacherNav>{children}</TeacherNav>
}