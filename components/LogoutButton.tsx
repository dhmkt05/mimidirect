"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { createBrowserClient } from "@supabase/auth-helpers-nextjs"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full bg-foreground px-5 py-2 text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  )
}
