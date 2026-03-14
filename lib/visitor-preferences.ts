export const VISITOR_ID_COOKIE = "md_visitor"
export const VISITOR_PREFS_COOKIE = "md_visitor_prefs"
export const VISITOR_CONSENT_COOKIE = "md_cookie_consent"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90

const COUNTRY_TERMS = ["myanmar", "india", "philippines", "indonesia", "sri lanka"]
const SKILL_PATTERNS = [
  { key: "cooking", pattern: /cook|cooking/i, label: "Cooking helper" },
  { key: "childcare", pattern: /child|childcare|baby|nanny/i, label: "Childcare helper" },
  { key: "elderly care", pattern: /elderly|senior|caregiver|care/i, label: "Elderly care helper" },
  { key: "cleaning", pattern: /clean|cleaning|housekeeping|laundry/i, label: "Cleaning helper" },
]

export type VisitorPreferences = {
  visitCount: number
  lastVisitedAt: string | null
  recentSearches: string[]
  preferredCountries: string[]
  preferredSkills: string[]
}

export const DEFAULT_VISITOR_PREFERENCES: VisitorPreferences = {
  visitCount: 0,
  lastVisitedAt: null,
  recentSearches: [],
  preferredCountries: [],
  preferredSkills: [],
}

export function createVisitorId() {
  return crypto.randomUUID()
}

export function hasVisitorConsent(rawValue?: string | null) {
  return rawValue === "accepted"
}

function normalizeStringList(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0))]
    .slice(0, maxItems)
}

export function parseVisitorPreferences(rawValue?: string | null): VisitorPreferences {
  if (!rawValue) {
    return { ...DEFAULT_VISITOR_PREFERENCES }
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<VisitorPreferences>

    return {
      visitCount: typeof parsed.visitCount === "number" && Number.isFinite(parsed.visitCount)
        ? parsed.visitCount
        : 0,
      lastVisitedAt: typeof parsed.lastVisitedAt === "string" ? parsed.lastVisitedAt : null,
      recentSearches: normalizeStringList(parsed.recentSearches, 5),
      preferredCountries: normalizeStringList(parsed.preferredCountries, 3),
      preferredSkills: normalizeStringList(parsed.preferredSkills, 4),
    }
  } catch {
    return { ...DEFAULT_VISITOR_PREFERENCES }
  }
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function extractSearchTerms(message: string) {
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

function extractCountries(message: string) {
  const normalized = message.toLowerCase()
  return COUNTRY_TERMS.filter((country) => normalized.includes(country))
}

function extractSkills(message: string) {
  return SKILL_PATTERNS.filter(({ pattern }) => pattern.test(message)).map(({ key }) => key)
}

export function updatePreferencesForVisit(preferences: VisitorPreferences): VisitorPreferences {
  return {
    ...preferences,
    visitCount: preferences.visitCount + 1,
    lastVisitedAt: new Date().toISOString(),
  }
}

export function updatePreferencesFromMessage(
  preferences: VisitorPreferences,
  message: string
): VisitorPreferences {
  const trimmedMessage = message.trim()

  if (!trimmedMessage) {
    return preferences
  }

  const recentSearches = [trimmedMessage, ...preferences.recentSearches.filter((entry) => entry !== trimmedMessage)]
    .slice(0, 5)
  const preferredCountries = [
    ...preferences.preferredCountries,
    ...extractCountries(trimmedMessage),
  ].filter((value, index, list) => list.indexOf(value) === index).slice(-3)
  const preferredSkills = [
    ...preferences.preferredSkills,
    ...extractSkills(trimmedMessage),
  ].filter((value, index, list) => list.indexOf(value) === index).slice(-4)

  return {
    ...preferences,
    lastVisitedAt: new Date().toISOString(),
    recentSearches,
    preferredCountries,
    preferredSkills,
  }
}

export function serializeVisitorPreferences(preferences: VisitorPreferences) {
  return JSON.stringify({
    visitCount: preferences.visitCount,
    lastVisitedAt: preferences.lastVisitedAt,
    recentSearches: preferences.recentSearches.slice(0, 5),
    preferredCountries: preferences.preferredCountries.slice(0, 3),
    preferredSkills: preferences.preferredSkills.slice(0, 4),
  })
}

export function getVisitorCookieOptions() {
  return {
    httpOnly: false,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
  }
}

export function buildSuggestionChips(preferences: VisitorPreferences) {
  const countrySuggestions = preferences.preferredCountries.map((country) => `${toTitleCase(country)} helper`)
  const skillSuggestions = preferences.preferredSkills
    .map((skill) => SKILL_PATTERNS.find((entry) => entry.key === skill)?.label ?? `${toTitleCase(skill)} helper`)

  const suggestions = [
    ...countrySuggestions,
    ...skillSuggestions,
    "Cooking helper",
    "Childcare helper",
    "Elderly care helper",
    "Myanmar helper",
  ]

  return [...new Set(suggestions)].slice(0, 6)
}

export function getPreferenceSummary(preferences: VisitorPreferences) {
  const parts: string[] = []

  if (preferences.preferredCountries.length > 0) {
    parts.push(preferences.preferredCountries.map(toTitleCase).join(", "))
  }

  if (preferences.preferredSkills.length > 0) {
    parts.push(preferences.preferredSkills.map(toTitleCase).join(", "))
  }

  return parts.join(" and ")
}

export function readCookieFromDocument(name: string) {
  if (typeof document === "undefined") {
    return null
  }

  const prefix = `${name}=`
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))

  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}
