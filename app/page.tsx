/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

import { getHelperImageSrc } from "@/lib/helper-utils"
import {
buildSuggestionChips,
getPreferenceSummary,
parseVisitorPreferences,
VISITOR_PREFS_COOKIE,
} from "@/lib/visitor-preferences"
import type { Helper } from "@/types/helper"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HomePage(){
const cookieStore = await cookies()
const supabaseAuth = createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
getAll() {
return cookieStore.getAll()
},
setAll(cookiesToSet) {
try {
cookiesToSet.forEach(({ name, value, options }) => {
cookieStore.set(name, value, options)
})
} catch {
// Homepage only needs read access for privacy-aware rendering.
}
},
},
}
)
const {
data: { session },
} = await supabaseAuth.auth.getSession()
const isLoggedIn = Boolean(session)
const visitorPreferences = parseVisitorPreferences(
cookieStore.get(VISITOR_PREFS_COOKIE)?.value
)
const personalizedSuggestions = buildSuggestionChips(visitorPreferences)
const preferenceSummary = getPreferenceSummary(visitorPreferences)
const isReturningVisitor = visitorPreferences.visitCount > 1

const { data, error } = await supabase
.from("helpers")
.select("*")
.limit(6)
const helpers = (data ?? []) as Helper[]

return(

<main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">

{/* HERO */}

<section className="rounded-[2rem] border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10">

<p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
AI-powered domestic helper matching
</p>

<h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
Find. Hire. Direct.
</h1>

<p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
{isReturningVisitor && preferenceSummary
? `Welcome back. We remember your interest in ${preferenceSummary}, so you can continue exploring without logging in.`
: "MimiDirect helps employers describe what they need and lets AI surface matching helpers faster, so you spend less time searching and more time hiring the right person."}
</p>

<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

<Link
href="/chat"
className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-contrast shadow-sm hover:-translate-y-0.5 hover:shadow-md"
>
Ask AI
</Link>

<Link
href="/helpers"
className="rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:-translate-y-0.5 hover:bg-surface-strong"
>
Browse Helpers
</Link>

</div>

<p className="mx-auto mt-5 max-w-xl text-sm text-muted">
{isLoggedIn
? "You are logged in, so helper photos are shown clearly."
: "You can still browse the site and use AI without logging in. Helper faces stay blurred on the homepage for privacy until you sign in."}
</p>

<div className="mt-6 flex flex-wrap justify-center gap-2">
{personalizedSuggestions.map((suggestion) => (
<Link
key={suggestion}
href={`/chat?prompt=${encodeURIComponent(suggestion)}`}
className="rounded-full border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-foreground hover:-translate-y-0.5 hover:bg-surface"
>
{suggestion}
</Link>
))}
</div>

</section>


{/* HELPERS */}

<section className="mt-14 sm:mt-20">

<div className="flex flex-col gap-3 text-center sm:text-left">
<h2 className="text-2xl font-bold sm:text-3xl">
Popular Helpers
</h2>

<p className="text-muted">
Preview trusted candidates below. AI search is still the fastest way to narrow by skills,
country, and availability.
</p>
</div>

{error ? (
<p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
We could not load helpers right now. Please try again shortly.
</p>
) : null}

<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

{helpers?.map((helper)=>(
<div
key={helper.id}
className="overflow-hidden rounded-3xl border border-border bg-surface-strong shadow-sm hover:-translate-y-1 hover:shadow-lg"
>

<div className="relative">
<img
src={getHelperImageSrc(helper.photo_url)}
alt={isLoggedIn ? helper.name : `${helper.country} helper preview`}
className={`h-56 w-full object-cover ${isLoggedIn ? "" : "scale-105 blur-md"}`}
/>

{!isLoggedIn ? (
<div className="absolute inset-0 flex items-center justify-center bg-slate-900/25">
<Link
href="/login?redirectTo=/helpers"
className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900"
>
Login to view full photo
</Link>
</div>
) : null}
</div>

<div className="p-5">
<h3 className="font-bold text-lg">
{helper.name}
</h3>

<p className="mt-1 text-muted">
{helper.country}
</p>

<p className="mt-3 text-sm text-foreground">
{helper.skills}
</p>

<p className="mt-2 text-sm text-muted">
{helper.experience} years experience
</p>

<Link
href={`/helpers/${helper.id}`}
className="mt-4 block rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground hover:bg-surface"
>
View Profile
</Link>
</div>

</div>
))}

</div>

</section>

</main>

)

}
