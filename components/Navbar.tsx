import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {

  return (

    <nav className="w-full border-b bg-white sticky top-0 z-50">

      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">

          <Image
            src="/logo.png"
            width={36}
            height={36}
            alt="MimiDirect"
          />

          <span className="font-bold text-lg">
            MimiDirect
          </span>

        </Link>


        {/* Navigation */}

        <div className="flex items-center gap-6 text-sm font-medium">

          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>

          <Link href="/helpers" className="hover:text-blue-600">
            Find Helpers
          </Link>

          <Link href="/chat" className="hover:text-blue-600">
            Ask AI
          </Link>

          <Link
            href="/login"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Login
          </Link>
          <ThemeToggle />
          
        </div>

      </div>

    </nav>

  )
}