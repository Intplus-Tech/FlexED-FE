"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DashboardIcon,
  PaymentsIcon,
  StudentsIcon,
  FeeManagementIcon,
  AppsToolsIcon,
  SettingsIcon,
  MoreIcon,
  LogoutIcon,
  ClassIcon,
} from "@/icon/dashbaord";

import { signOut } from "next-auth/react";
import { showinfo } from "@/utils/toast";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetShoolProfileQuery } from "@/redux/api/school";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Settlement",
    href: "/dashboard/settlement",
    icon: <PaymentsIcon />,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: <PaymentsIcon />,
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: <StudentsIcon />,
  },
  {
    label: "Class Management",
    href: "/dashboard/class-management",
    icon: <ClassIcon />,
  },
  {
    label: "Academic Sessions",
    href: "/dashboard/academic-session",
    icon: <ClassIcon />,
  },
  {
    label: "Fee management",
    href: "/dashboard/fee-management",
    icon: <FeeManagementIcon />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Apps/Tools",
    href: "/dashboard/apps",
    icon: <AppsToolsIcon />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <SettingsIcon />,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const { data: SchoolProfile, isFetching: isFetchingSchoolProfile } =
    useGetShoolProfileQuery();
  const { currentUser } = useSelector((state: RootState) => state.authState);
  const fallbackUrl = "/images/logo2.svg";

  const isActive = (href: string) => {
    return pathname === href;
  };

  const handleLogOut = async () => {
    try {
      setShowProfileMenu(false);
      const data = await signOut({
        redirect: false,
        callbackUrl: "/auth/sign-in",
      });
      router.push(data?.url || "/auth/sign-in");
      showinfo("Logged out successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] lg:w-[300px] border-r border-gray-200 bg-white  flex flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-6">
        <div className="relative w-[50px] h-[50px]">
          {/* Loading skeleton */}
          {imgLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
          )}

          {/* Error fallback */}
          {imgError ? (
            <Image
              src={fallbackUrl}
              alt="logo"
              width={50}
              height={50}
              className="rounded-full"
            />
          ) : (
            <Image
              src={SchoolProfile?.data?.logoUrl?.url || fallbackUrl}
              alt="logo"
              width={70}
              height={70}
              className={`rounded-full transition-opacity duration-300 ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
            />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className=" font-bold text-gray-900">
            {SchoolProfile?.data.name ?? "Flex-ed"}
          </h1>
          <p className="truncate text-xs text-gray-600">Powered By Int+</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive(item.href)
                  ? "bg-purple-600 text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Bottom Navigation Items */}
        <div className="space-y-3">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive(item.href)
                  ? "bg-primary-700 text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center shrink-0">
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 px-4 py-6">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex w-full items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              SA
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser?.role
                  .split("_")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {currentUser?.email}
              </p>
            </div>
            <div className="flex h-6 w-6 items-center justify-center shrink-0">
              <MoreIcon />
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                onClick={handleLogOut}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <LogoutIcon />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
