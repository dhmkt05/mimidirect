import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import type { ChatResponse, Helper } from "@/types/helper"
import {
  VISITOR_CONSENT_COOKIE,
  VISITOR_ID_COOKIE,
  VISITOR_PREFS_COOKIE,
  createVisitorId,
  extractSearchTerms,
  getVisitorCookieOptions,
  hasVisitorConsent,
  parseVisitorPreferences,
  serializeVisitorPreferences,
  updatePreferencesFromMessage,
} from "@/lib/visitor-preferences"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type WebhookHelper =
  | Helper
  | {
      output?: string
    }

function parseHelperLine(line: string, index: number): Helper | null {
  const match = line.match(/^\d+\.\s*(.+?)\s*\((.+?)\):\s*(.+)$/i)

  if (!match) {
    return null
  }

  const [, name, country, details] = match
  const rateMatch = details.match(/,\s*(\$\d+(?:\.\d+)?(?:\s+\w+)?)$/i)
  const rate = rateMatch?.[1]?.trim() ?? null
  const skills = rateMatch
    ? details.slice(0, rateMatch.index).trim()
    : details.trim()

  return {
    id: `webhook-${index + 1}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: name.trim(),
    country: country.trim(),
    skills,
    experience: null,
    photo_url: null,
    whatsapp: null,
    rate: rate?.trim() ?? null,
  }
}

function normalizeChatResponse(payload: unknown): ChatResponse {
  if (!payload || typeof payload !== "object") {
    return {}
  }

  const response = payload as { helpers?: WebhookHelper[] }
  const rawHelpers = Array.isArray(response.helpers) ? response.helpers : []
  const firstOutput =
    rawHelpers.find(
      (helper): helper is { output: string } =>
        typeof helper === "object" &&
        helper !== null &&
        "output" in helper &&
        typeof helper.output === "string"
    )?.output ?? null

  const normalizedHelpers = rawHelpers.flatMap((helper, index) => {
    if (
      typeof helper === "object" &&
      helper !== null &&
      "name" in helper &&
      typeof helper.name === "string"
    ) {
      return [helper as Helper]
    }

    if (
      typeof helper === "object" &&
      helper !== null &&
      "output" in helper &&
      typeof helper.output === "string"
    ) {
      return helper.output
        .split("\n")
        .map((line) => parseHelperLine(line.trim(), index))
        .filter((value): value is Helper => Boolean(value))
    }

    return []
  })

  return {
    helpers: normalizedHelpers,
    reply: firstOutput,
  }
}

async function withVisitorCookies(response: NextResponse, message: string) {
  const cookieStore = await cookies()
  const hasConsent = hasVisitorConsent(cookieStore.get(VISITOR_CONSENT_COOKIE)?.value)

  if (!hasConsent) {
    return response
  }

  const visitorId = cookieStore.get(VISITOR_ID_COOKIE)?.value ?? createVisitorId()
  const preferences = parseVisitorPreferences(cookieStore.get(VISITOR_PREFS_COOKIE)?.value)
  const updatedPreferences = updatePreferencesFromMessage(preferences, message)
  const cookieOptions = getVisitorCookieOptions()

  response.cookies.set(VISITOR_ID_COOKIE, visitorId, cookieOptions)
  response.cookies.set(
    VISITOR_PREFS_COOKIE,
    serializeVisitorPreferences(updatedPreferences),
    cookieOptions
  )

  return response
}

function isHelperSearchIntent(message: string) {
  const normalized = message.toLowerCase()

  return [
    "helper",
    "cook",
    "cooking",
    "child",
    "childcare",
    "elderly",
    "care",
    "cleaning",
    "laundry",
    "maid",
    "nanny",
    "myanmar",
    "india",
    "philippines",
    "indonesia",
    "experience",
    "hire",
    "looking for",
    "find",
  ].some((term) => normalized.includes(term))
}

async function searchHelpersInSupabase(message: string) {
  const terms = extractSearchTerms(message)

  if (terms.length === 0) {
    const { data } = await supabase
      .from("helpers")
      .select("*")
      .limit(6)

    return (data ?? []) as Helper[]
  }

  const filters = terms.flatMap((term) => [
    `name.ilike.%${term}%`,
    `country.ilike.%${term}%`,
    `skills.ilike.%${term}%`,
    `description.ilike.%${term}%`,
    `languages.ilike.%${term}%`,
  ])

  const { data } = await supabase
    .from("helpers")
    .select("*")
    .or(filters.join(","))
    .limit(12)

  const helpers = ((data ?? []) as Helper[]).sort((left, right) => {
    const leftScore = terms.reduce((score, term) => {
      const haystack = `${left.name} ${left.country} ${left.skills} ${left.description ?? ""} ${left.languages ?? ""}`.toLowerCase()
      return haystack.includes(term) ? score + 1 : score
    }, 0)

    const rightScore = terms.reduce((score, term) => {
      const haystack = `${right.name} ${right.country} ${right.skills} ${right.description ?? ""} ${right.languages ?? ""}`.toLowerCase()
      return haystack.includes(term) ? score + 1 : score
    }, 0)

    return rightScore - leftScore
  })

  return helpers
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message =
      typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return await withVisitorCookies(
        NextResponse.json(
          { error: "A search message is required." },
          { status: 400 }
        ),
        message
      )
    }

    const res = await fetch(
      "https://n8n.srv1226738.hstgr.cloud/webhook/helper-search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(15000),
      }
    )

    if (!res.ok) {
      return await withVisitorCookies(
        NextResponse.json(
          { error: "The AI helper search service is unavailable right now." },
          { status: 502 }
        ),
        message
      )
    }

    const data = await res.json()
    const normalized = normalizeChatResponse(data)

    if ((normalized.helpers?.length ?? 0) > 0) {
      return await withVisitorCookies(NextResponse.json(normalized), message)
    }

    if (!isHelperSearchIntent(message)) {
      return await withVisitorCookies(
        NextResponse.json({
          helpers: [],
          reply:
            normalized.reply ??
            "Hello! I can help you find domestic helpers or answer questions about hiring through MimiDirect.",
        }),
        message
      )
    }

    const fallbackHelpers = await searchHelpersInSupabase(message)

    return await withVisitorCookies(
      NextResponse.json({
        helpers: fallbackHelpers,
        reply:
          normalized.reply ??
          (fallbackHelpers.length > 0
            ? "I found some helper profiles that may match your request."
            : "I could not find matching helpers yet. Try a simpler search like 'Myanmar cooking helper'."),
      }),
      message
    )
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The AI helper search timed out."
        : "The AI helper search failed."

    return await withVisitorCookies(
      NextResponse.json({ error: message }, { status: 500 }),
      ""
    )
  }
}
