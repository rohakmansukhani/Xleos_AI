import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xleos AI Studio",
  description: "Next-level AI storyboard and stock video curation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`antialiased bg-gradient-to-br from-[#120624] via-black to-[#2E2175] text-white min-h-screen`}>
        {/* (body class sets glass/dark BG for all pages; text-white for light text) */}
        {children}
      </body>
    </html>
  );
}
