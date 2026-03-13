"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { createBrowserClient } from "@supabase/auth-helpers-nextjs"

type AuthFormProps = {
  mode: "login" | "signup"
  redirectTo?: string
}

export default function AuthForm({ mode, redirectTo = "/helpers" }: AuthFormProps) {
  const router = useRouter()
  const isLogin = mode === "login"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          throw signInError
        }

        router.push(redirectTo)
        router.refresh()
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session) {
        router.push(redirectTo)
        router.refresh()
        return
      }

      setSuccess("Account created. Check your email to confirm your signup.")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border px-4 py-3"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Enter your password"
          minLength={6}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
      </button>

      <p className="text-sm text-gray-600">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : `/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-black underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  )
}
