"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
// import { Logo } from "@/icon/auth/icon";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(".auth-logo", {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: "back.out",
    });

    tl.from(
      ".auth-heading-1",
      {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.4",
    );

    tl.from(
      ".auth-heading-2",
      {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.3",
    );

    // Animate description text
    tl.from(
      ".auth-description",
      {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.3",
    );
  }, []);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col  items-center justify-center">
        <div className="max-w-md">
          <div className="mb-8 auth-logo">
            {/* <Logo /> */}
            <Image src="/favicon.ico" width={100} height={100} alt="" />
          </div>

          <h1 className="text-4xl font-bold mb-2 text-gray-900 auth-heading-1">
            Welcome to
          </h1>
          <h1 className="text-4xl  mb-6 auth-heading-2">
            <span className="text-[#9E97FF] font-bold">FlexEd</span>{" "}
            <span className="text-[#9E97FF]">Systems</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed auth-description">
            Streamline your fee collection and reconciliation
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
