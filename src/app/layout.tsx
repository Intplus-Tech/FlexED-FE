import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FlexED Systems",
    template: "%s | FlexED Systems",
  },
  description:
    "A payment reconciliation platform that automates school fee tracking, receipt generation, and financial reporting for educational institutions.",
  keywords: [
    "school fee management",
    "payment reconciliation",
    "educational finance",
    "fee tracking",
    "receipt generation",
    "financial reporting",
    "school administration",
  ],
  authors: [{ name: "FlexED Systems" }],
  creator: "FlexED Systems",
  publisher: "FlexED Systems",
  metadataBase: new URL("https://flexedsystems.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flexedsystems.com",
    title: "FlexED Systems",
    description:
      "A payment reconciliation platform that automates school fee tracking, receipt generation, and financial reporting for educational institutions.",
    siteName: "FlexED Systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlexED Systems",
    description:
      "A payment reconciliation platform that automates school fee tracking, receipt generation, and financial reporting for educational institutions.",
    creator: "@flexedsystems",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            expand={true}
            richColors
            visibleToasts={3}
            gap={14}
            position="top-right"
          />
        </Providers>
      </body>
    </html>
  );
}
