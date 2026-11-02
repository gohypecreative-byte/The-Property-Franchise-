// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorSuppressor } from "@/components/common/ErrorSuppressor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F7F9FC",
};

export const metadata: Metadata = {
  title: "The Property Franchise | Commercial Real Estate Franchise Network",
  description:
    "An interactive cinematic commercial property franchise network. Explore prime office towers, corporate campuses, logistics hubs, and global franchise territories.",
  icons: {
    icon: "/tpf_logo.jpg",
    apple: "/tpf_logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7F9FC] text-[#012169] selection:bg-[#E4002B] selection:text-[#F7F9FC]">
        <ErrorSuppressor />
        {children}
      </body>
    </html>
  );
}
