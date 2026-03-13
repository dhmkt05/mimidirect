"use client"

import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="border px-3 py-1 rounded text-sm"
    >
      Toggle Theme
    </button>
  )
}
