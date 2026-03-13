import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            width={36}
            height={36}
            alt="MimiDirect"
            className="h-9 w-9 rounded-full object-cover"
          />

          <span className="text-2xl font-bold tracking-tight text-foreground">
            MimiDirect
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium sm:gap-3">
          <Link href="/" className="rounded-full px-3 py-2 text-foreground hover:bg-surface-strong">
            Home
          </Link>

          <Link href="/helpers" className="rounded-full px-3 py-2 text-foreground hover:bg-surface-strong">
            Find Helpers
          </Link>

          <Link href="/chat" className="rounded-full px-3 py-2 text-foreground hover:bg-surface-strong">
            Ask AI
          </Link>

          <Link
            href="/login"
            className="rounded-full bg-foreground px-5 py-2 text-background hover:opacity-90"
          >
            Login
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
