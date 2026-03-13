import Navbar from "../components/Navbar"
import AIChatWidget from "../components/AIChatWidget"
import { ThemeProvider } from "next-themes"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MimiDirect",
  description: "Find and hire domestic helpers directly",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

          <Navbar />

          <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            {children}
          </main>

          <AIChatWidget />

        </ThemeProvider>
      </body>
    </html>
  )
}
