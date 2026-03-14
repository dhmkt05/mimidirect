"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  VISITOR_CONSENT_COOKIE,
  getVisitorCookieOptions,
} from "@/lib/visitor-preferences"

export default function CookieNotice() {
  const router = useRouter()
  const [hidden, setHidden] = useState(false)

  if (hidden) {
    return null
  }

  function acceptCookies() {
    const options = getVisitorCookieOptions()
    const parts = [
      `${VISITOR_CONSENT_COOKIE}=accepted`,
      `Max-Age=${options.maxAge}`,
      `Path=${options.path}`,
      "SameSite=Lax",
    ]

    document.cookie = parts.join("; ")
    setHidden(true)
    router.refresh()
  }

  function dismissNotice() {
    setHidden(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-5 shadow-2xl">
      <p className="text-sm font-semibold text-foreground">
        Cookie notice
      </p>

      <p className="mt-2 text-sm text-muted">
        MimiDirect can save anonymous search preferences in cookies so returning employers
        see more relevant helper suggestions without logging in.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={acceptCookies}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast"
        >
          Accept cookies
        </button>

        <button
          type="button"
          onClick={dismissNotice}
          className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
