import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  VISITOR_CONSENT_COOKIE,
  VISITOR_ID_COOKIE,
  VISITOR_PREFS_COOKIE,
  createVisitorId,
  getVisitorCookieOptions,
  hasVisitorConsent,
  parseVisitorPreferences,
  serializeVisitorPreferences,
  updatePreferencesForVisit,
} from "@/lib/visitor-preferences"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const hasConsent = hasVisitorConsent(request.cookies.get(VISITOR_CONSENT_COOKIE)?.value)

  if (!hasConsent) {
    return response
  }

  const visitorId = request.cookies.get(VISITOR_ID_COOKIE)?.value ?? createVisitorId()
  const currentPreferences = parseVisitorPreferences(request.cookies.get(VISITOR_PREFS_COOKIE)?.value)
  const updatedPreferences = updatePreferencesForVisit(currentPreferences)

  response.cookies.set(VISITOR_ID_COOKIE, visitorId, getVisitorCookieOptions())
  response.cookies.set(
    VISITOR_PREFS_COOKIE,
    serializeVisitorPreferences(updatedPreferences),
    getVisitorCookieOptions()
  )

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
