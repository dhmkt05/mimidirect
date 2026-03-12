import Navbar from "../components/Navbar"
import AIChatWidget from "../components/AIChatWidget" 
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
  title: "MimiDirect",
  description: "Find and hire domestic helpers directly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<AIChatWidget />
        {/* Navbar appears on every page */}
        <Navbar />

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}