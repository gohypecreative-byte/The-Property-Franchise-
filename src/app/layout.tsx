// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorSuppressor } from "@/components/common/ErrorSuppressor";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FCF8F3",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FCF8F3] text-[#012169] selection:bg-[#A10728] selection:text-[#FCF8F3]">
        <ErrorSuppressor />
        {children}
      </body>
    </html>
  );
}
