import { NextResponse } from "next/server"

import type { ChatResponse, Helper } from "@/types/helper"

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
    summary: firstOutput,
  }
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

    return NextResponse.json(normalizeChatResponse(data))
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The AI helper search timed out."
        : "The AI helper search failed."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
