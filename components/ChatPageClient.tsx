"use client"

import { useEffect, useRef, useState } from "react"

import { getHelperImageSrc, getWhatsAppLink } from "@/lib/helper-utils"
import {
  VISITOR_PREFS_COOKIE,
  buildSuggestionChips,
  getPreferenceSummary,
  parseVisitorPreferences,
  readCookieFromDocument,
} from "@/lib/visitor-preferences"
import type { ChatMessage, ChatResponse, Helper } from "@/types/helper"

/* eslint-disable @next/next/no-img-element */

type ChatPageClientProps = {
  initialPrompt?: string
}

export default function ChatPageClient({ initialPrompt = "" }: ChatPageClientProps) {
  const [message, setMessage] = useState(initialPrompt)
  const [suggestions, setSuggestions] = useState<string[]>([
    "Cooking helper",
    "Childcare helper",
    "Elderly care helper",
    "Myanmar helper",
  ])
  const [visitorSummary, setVisitorSummary] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I can chat normally and also help you find domestic helpers. Tell me what you need, or just say hi.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const rawPreferences = readCookieFromDocument(VISITOR_PREFS_COOKIE)

    if (!rawPreferences) {
      return
    }

    const preferences = parseVisitorPreferences(rawPreferences)

    setSuggestions(buildSuggestionChips(preferences))
    setVisitorSummary(getPreferenceSummary(preferences))
  }, [])

  useEffect(() => {
    setMessage(initialPrompt)
  }, [initialPrompt])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, error, loading])

  async function searchHelpers(nextMessage?: string) {
    const trimmedMessage = (nextMessage ?? message).trim()

    if (!trimmedMessage) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmedMessage,
    }

    setLoading(true)
    setError(null)
    setMessage("")
    setMessages((current) => [...current, userMessage])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      })

      if (!res.ok) {
        const fallbackError = "We could not reach the AI helper search right now."
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || fallbackError)
      }

      const data: ChatResponse = await res.json()
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          data.reply ||
          ((data.helpers?.length ?? 0) > 0
            ? "Here are some helper profiles that match your request."
            : "I’m here to help. Try asking about a helper type, country, or experience level."),
        helpers: data.helpers || [],
      }

      setMessages((current) => [...current, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search error. Please try again.")
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          content: "I ran into an issue while responding. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
        Mimi AI Assistant
      </h1>

      <p className="mb-8 max-w-2xl text-muted">
        Describe the kind of helper you need and MimiDirect AI will return simple helper cards you can contact directly.
      </p>

      {visitorSummary ? (
        <p className="mb-4 max-w-2xl text-sm text-muted">
          Welcome back. We remembered your recent interests in {visitorSummary}.
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setMessage(suggestion)
              searchHelpers(suggestion)
            }}
            disabled={loading}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Example: Myanmar cooking helper"
          disabled={loading}
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") searchHelpers()
          }}
        />

        <button
          onClick={() => searchHelpers()}
          disabled={loading || !message.trim()}
          className="rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-contrast disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
        >
          {loading ? "Searching..." : "Ask AI"}
        </button>
      </div>

      {error ? (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-6">
        {messages.map((entry) => (
          <div key={entry.id} className={entry.role === "user" ? "ml-auto max-w-3xl" : "max-w-4xl"}>
            <div
              className={
                entry.role === "user"
                  ? "ml-auto max-w-2xl rounded-3xl bg-accent px-5 py-4 text-accent-contrast"
                  : "rounded-3xl border border-border bg-surface px-5 py-4 text-foreground shadow-sm"
              }
            >
              <p className="whitespace-pre-wrap text-sm sm:text-base">
                {entry.content}
              </p>
            </div>

            {entry.helpers && entry.helpers.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {entry.helpers.map((helper: Helper) => (
                  <div
                    key={helper.id}
                    className="rounded-3xl border border-border bg-surface p-5 shadow-sm"
                  >
                    <img
                      src={getHelperImageSrc(helper.photo_url)}
                      alt={helper.name}
                      className="h-44 w-full rounded-2xl object-cover"
                    />

                    <h3 className="mt-4 text-xl font-bold">
                      {helper.name}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      {helper.country}
                    </p>

                    <p className="mt-3 text-sm text-foreground">
                      {helper.skills}
                    </p>

                    {helper.experience ? (
                      <p className="mt-2 text-sm text-muted">
                        {helper.experience} years experience
                      </p>
                    ) : null}

                    {helper.rate ? (
                      <p className="mt-2 text-sm text-muted">
                        Rate: {helper.rate}
                      </p>
                    ) : null}

                    <a
                      href={getWhatsAppLink(
                        helper.whatsapp,
                        `Hi, I found ${helper.name} on MimiDirect and I am interested.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block rounded-full bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Contact Helper
                    </a>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!loading && !error && messages.length === 1 ? (
        <p className="mt-8 rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
          Start with a greeting or ask for something like &quot;I need a Myanmar cooking helper with childcare experience.&quot;
        </p>
      ) : null}
    </main>
  )
}
