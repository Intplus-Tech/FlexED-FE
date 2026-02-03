"use client";
import { SignInResponse } from "@/@types/auth";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { setAuth } from "@/redux/slice/auth";
import { RootState } from "@/redux/store";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const { data, status } = useSession();
  const { currentUser } = useSelector((state: RootState) => state.authState);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const Data = data as unknown as {
        accessToken: string;
        refreshToken: string;
        user: SignInResponse["data"]["user"];
      };
      dispatch(
        setAuth({
          accessToken: Data.accessToken,
          currentUser: Data.user,
        }),
      );
    }
  }, [status, data, dispatch]);

  useEffect(() => {
    if (status === "unauthenticated" && !currentUser) {
      router.push("/auth/sign-in");
    }
  }, [status, router]);

  if (status === "loading" || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />

      <main className="ml-[250px] lg:ml-[300px] flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
