"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  BookText,
  Gamepad2,
  Settings
} from "lucide-react";

interface TeacherNavProps {
  children: ReactNode;
}

export default function TeacherNav({ children }: TeacherNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      href: "/dashboard",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      name: "Dashboard",
    },
    {
      href: "/story-management",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v13m0-13C10.8 5.5 9.2 5 7.5 5S4.2 5.5 3 6.3V19c1.2-.8 2.8-1.3 4.5-1.3s3.3.5 4.5 1.3V6zM12 6c1.2-.5 2.8-1 4.5-1s3.3.5 4.5 1.3V19c-1.2-.8-2.8-1.3-4.5-1.3s-3.3.5-4.5 1.3"
        />
      ),
      name: "Stories",
    },
    {
      href: "/student-log",
      icon: <BookText />,
      name: "Student Submissions",
    },
    {
      href: "/games-management",
      icon: <Gamepad2 />,
      name: "Games Management",
    },
    {
      href: "/user-management",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      ),
      name: "Users",
    },
    {
      href: "/settings",
      icon: <Settings />,
      name: "Settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 z-50 w-25 bg-[#BEDBFF] flex-col"
        style={{ boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center h-16 mt-3">
          <Link
            href="/dashboard"
            className="text-[10px] font-medium text-blue-800 px-2 mt-1 text-center items-center flex-col align-center flex gap-2 hover:text-blue-800 transition-colors"
          >
            <Image
              src="/images/magandang-buhay-rbg.png"
              alt="logo"
              width={30}
              height={30}
            />
            E-KWENTO
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 rounded-lg hover:text-blue-800 transition-colors
                          ${pathname === item.href
                  ? "text-blue-800"
                  : "text-black"
                }`}
            >
              <svg
                className="w-[30px] h-[30px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {item.icon}
              </svg>
              <span className="text-[12px] font-medium text-center">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/magandang-buhay-rbg.png"
              alt="logo"
              width={24}
              height={24}
            />
            <span className="text-sm font-semibold text-blue-800">
              E-KWENTO
            </span>
          </Link>
          <div className="scale-75">
            {mounted && (
              <UserButton
                // showName={false}
                appearance={{
                  elements: {
                    // userPreview: {  // Hide user preview
                    //   display: "none",
                    // },
                    userButtonPopoverFooter: {  // Hide footer
                      display: "none",
                    },
                    userPreviewAvatarBox: {
                      display: "none",
                    },
                  },
                }}
                userProfileProps={{
                  appearance: {
                    elements: {
                      // profileSectionPrimaryButton__profile: {  // Hide profile picture update
                      //   display: "none",
                      // },
                      profileSection__connectedAccounts: {
                        display: "none",
                      },
                      profileSectionPrimaryButton__emailAddresses: {
                        display: "none",
                      },
                      profileSection__danger: {
                        display: "none",
                      },
                      menuButtonEllipsis: {
                        display: "none",
                      }
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation Icons */}
        <nav className="flex justify-around items-center py-2 bg-white border-b border-gray-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 relative transition-colors
                          ${pathname === item.href
                  ? "text-blue-800"
                  : "text-gray-600"
                }`}
            >
              <svg
                className="w-6 h-6 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {item.icon}
              </svg>
              <span className="text-xs font-medium text-center leading-tight">
                {item.name === "Quiz Viewing" ? "Quiz" :
                  item.name === "Student Submissions" ? "Logs" :
                    item.name}
              </span>
              {/* Active indicator underline */}
              {pathname === item.href && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-800 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-25">
        {/* Desktop Header */}
        <header
          className="hidden md:flex sticky top-0 bg-white min-h-16 sm:h-21 items-center px-2 sm:px-4 lg:px-8 justify-between z-10"
          style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
              {/* Desktop date format */}
              <span className="hidden sm:block text-xl font-medium text-blue-800 truncate">
                {mounted && new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                  timeZone: "Asia/Manila",
                })}
              </span>
              {/* <span className="text-xl font-medium text-blue-800 truncate">
                {
                  pathname === "/dashboard"
                    ? "Dashboard"
                    : pathname === "/story-management"
                      ? "Stories"
                      : pathname === "/quiz-management"
                        ? "Quiz Viewing"
                        : pathname === "/student-log"
                          ? "Student Submissions"
                          : pathname === "/user-management"
                            ? "Users"
                            : "Settings"
                }
              </span> */}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="scale-90 lg:scale-100">
              {mounted && (
                <UserButton
                  // <UserButton
                  //   showName={true}
                  //   appearance={{
                  //     elements: {
                  //       userButtonBox: "text-blue-800 font-semibold text-2xl",
                  //       userButtonName: "text-blue-800 font-semibold text-2xl",
                  //       userButtonPopoverFooter: {
                  //         display: "none",
                  //       }
                  //     },
                  //   }}
                  // />
                  showName={true}
                  appearance={{
                    elements: {
                      userButtonBox: "text-blue-800 font-semibold text-2xl",
                      userButtonName: "text-blue-800 font-semibold text-2xl",
                      userPreview: {  // Hide user preview
                        display: "none",
                      },
                      userButtonPopoverFooter: {  // Hide footer
                        display: "none",
                      }
                    },
                  }}
                  userProfileProps={{
                    appearance: {
                      elements: {
                        // profileSectionPrimaryButton__profile: {  // Hide profile picture update
                        //   display: "none",
                        // },
                        profileSection__connectedAccounts: {
                          display: "none",
                        },
                        profileSectionPrimaryButton__emailAddresses: {
                          display: "none",
                        },
                        profileSection__danger: {
                          display: "none",
                        },
                        menuButtonEllipsis: {
                          display: "none",
                        }
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </header>

        {/* Mobile Content Header */}
        <div className="md:hidden pt-[104px] px-4 py-3 bg-gray-50">
          .
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 md:pt-8 pt-0">{children}</main>
      </div>
    </div>
  );
}
