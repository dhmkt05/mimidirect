import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import type { ChatResponse, Helper } from "@/types/helper"

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

function extractSearchTerms(message: string) {
  const normalized = message.toLowerCase()
  const explicitTerms = [
    "myanmar",
    "india",
    "philippines",
    "indonesia",
    "cooking",
    "cook",
    "child",
    "childcare",
    "elderly",
    "cleaning",
    "laundry",
    "care",
  ].filter((term) => normalized.includes(term))

  const keywordTerms = normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter(
      (word) =>
        ![
          "want",
          "need",
          "helper",
          "with",
          "that",
          "take",
          "have",
          "year",
          "years",
          "experience",
          "looking",
          "find",
        ].includes(word)
    )

  return [...new Set([...explicitTerms, ...keywordTerms])].slice(0, 8)
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
      return NextResponse.json(
        { error: "A search message is required." },
        { status: 400 }
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
      return NextResponse.json(
        { error: "The AI helper search service is unavailable right now." },
        { status: 502 }
      )
    }

    const data = await res.json()
    const normalized = normalizeChatResponse(data)

    if ((normalized.helpers?.length ?? 0) > 0) {
      return NextResponse.json(normalized)
    }

    if (!isHelperSearchIntent(message)) {
      return NextResponse.json({
        helpers: [],
        reply:
          normalized.reply ??
          "Hello! I can help you find domestic helpers or answer questions about hiring through MimiDirect.",
      })
    }

    const fallbackHelpers = await searchHelpersInSupabase(message)

    return NextResponse.json({
      helpers: fallbackHelpers,
      reply:
        normalized.reply ??
        (fallbackHelpers.length > 0
          ? "I found some helper profiles that may match your request."
          : "I could not find matching helpers yet. Try a simpler search like 'Myanmar cooking helper'."),
    })
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The AI helper search timed out."
        : "The AI helper search failed."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
