import Navbar from "../components/Navbar"
import AIChatWidget from "../components/AIChatWidget"
import CookieNotice from "../components/CookieNotice"
import { ThemeProvider } from "next-themes"
import type { Metadata } from "next"
import { cookies } from "next/headers"

import {
  VISITOR_CONSENT_COOKIE,
  VISITOR_PREFS_COOKIE,
  buildSuggestionChips,
  getPreferenceSummary,
  hasVisitorConsent,
  parseVisitorPreferences,
} from "@/lib/visitor-preferences"
import "./globals.css"

export const metadata: Metadata = {
  title: "MimiDirect",
  description: "Find and hire domestic helpers directly",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const consentAccepted = hasVisitorConsent(cookieStore.get(VISITOR_CONSENT_COOKIE)?.value)
  const preferences = parseVisitorPreferences(cookieStore.get(VISITOR_PREFS_COOKIE)?.value)
  const suggestionChips = buildSuggestionChips(preferences)
  const preferenceSummary = getPreferenceSummary(preferences)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>

          <Navbar />

          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>

          <AIChatWidget
            initialSuggestions={suggestionChips}
            preferenceSummary={preferenceSummary}
          />

          {!consentAccepted ? <CookieNotice /> : null}

        </ThemeProvider>
      </body>
    </html>
  )
}
