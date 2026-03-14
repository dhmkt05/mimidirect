"use client"

import { useEffect, useRef, useState } from "react"

import {
  VISITOR_PREFS_COOKIE,
  buildSuggestionChips,
  getPreferenceSummary,
  parseVisitorPreferences,
  readCookieFromDocument,
} from "@/lib/visitor-preferences"
import { getHelperImageSrc, getWhatsAppLink } from "@/lib/helper-utils"
import type { ChatMessage, ChatResponse, Helper } from "@/types/helper"

/* eslint-disable @next/next/no-img-element */

type AIChatWidgetProps = {
initialSuggestions?: string[]
preferenceSummary?: string
}

export default function AIChatWidget({
initialSuggestions = [],
preferenceSummary = "",
}: AIChatWidgetProps){

const [open,setOpen] = useState(false)
const [message,setMessage] = useState("")
const [suggestions,setSuggestions] = useState<string[]>(initialSuggestions)
const [visitorSummary,setVisitorSummary] = useState(preferenceSummary)
const messagesEndRef = useRef<HTMLDivElement | null>(null)
const [messages,setMessages] = useState<ChatMessage[]>([
{
id: "widget-welcome",
role: "assistant",
content: preferenceSummary
? `Welcome back. I can help with ${preferenceSummary} or new helper needs.`
: "Hi! I can chat with you or help you find a suitable helper.",
},
])
const [loading,setLoading] = useState(false)
const [error,setError] = useState<string | null>(null)

useEffect(() => {
const rawPreferences = readCookieFromDocument(VISITOR_PREFS_COOKIE)

if (!rawPreferences) {
return
}

const parsedPreferences = parseVisitorPreferences(rawPreferences)
const nextSuggestions = buildSuggestionChips(parsedPreferences)
const nextSummary = getPreferenceSummary(parsedPreferences)

setSuggestions(nextSuggestions)
setVisitorSummary(nextSummary)
}, [])

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
}, [messages, error, loading])

async function searchHelpers(msg?:string){
const query = (msg || message).trim()

if(!query.trim()) return

const userMessage: ChatMessage = {
id: `${Date.now()}-widget-user`,
role: "user",
content: query,
}

setLoading(true)
setError(null)
setMessage("")
setMessages((current) => [...current, userMessage])

try {
const res = await fetch("/api/chat",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({message:query})
})

if(!res.ok){
const fallbackError = "We could not reach the AI helper search right now."
const errorData = await res.json().catch(() => null)
throw new Error(errorData?.error || fallbackError)
}

const data: ChatResponse = await res.json()
const assistantMessage: ChatMessage = {
id: `${Date.now()}-widget-assistant`,
role: "assistant",
content:
data.reply ||
((data.helpers?.length ?? 0) > 0
? "Here are some helpers that may suit your request."
: "I’m here to help. Try asking about a type of helper or say hello."),
helpers: data.helpers || [],
}

setMessages((current) => [...current, assistantMessage])
} catch (err) {
setError(err instanceof Error ? err.message : "Search error. Please try again.")
setMessages((current) => [
...current,
{
id: `${Date.now()}-widget-assistant-error`,
role: "assistant",
content: "I ran into an issue while responding. Please try again.",
},
])
} finally {
setLoading(false)
}
}

return(

<div className="fixed bottom-6 right-6 z-50">

{open && (

<div className="flex h-[520px] w-[calc(100vw-2rem)] max-w-[360px] flex-col rounded-2xl border border-border bg-surface shadow-2xl">

<div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">

<div className="flex items-center gap-2">
<span className="text-lg">🤖</span>
<p className="font-semibold">Mimi AI Assistant</p>
</div>

<button onClick={()=>setOpen(false)} className="text-white text-sm">
✕
</button>

</div>

<div className="flex-1 overflow-y-auto p-4 space-y-4">

{error ? (
<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
{error}
</div>
) : null}

<div className="space-y-2">

{visitorSummary ? (
<p className="text-xs text-muted">
Recent interests: {visitorSummary}
</p>
) : null}

<div className="flex flex-wrap gap-2">
{suggestions.map((suggestion) => (
<button
key={suggestion}
onClick={()=>searchHelpers(suggestion)}
disabled={loading}
className="rounded-full border border-border bg-surface-strong px-3 py-1 text-xs text-foreground hover:bg-surface"
>
{suggestion}
</button>
))}
</div>

</div>

{messages.map((entry)=>(
<div key={entry.id}>
<div
className={
entry.role === "user"
? "ml-auto max-w-[85%] rounded-2xl bg-accent px-3 py-2 text-sm text-accent-contrast"
: "max-w-[90%] rounded-2xl border border-border bg-surface-strong px-3 py-2 text-sm text-foreground"
}
>
{entry.content}
</div>

{entry.helpers && entry.helpers.length > 0 ? (
<div className="mt-3 space-y-3">
{entry.helpers.map((helper: Helper)=>(
<div
key={helper.id}
className="flex gap-3 rounded-xl border border-border bg-surface-strong p-3 shadow-sm"
>

<img
src={getHelperImageSrc(helper.photo_url)}
alt={helper.name}
className="h-14 w-14 rounded-lg object-cover"
/>

<div className="flex-1 text-sm">

<p className="font-semibold">
{helper.name}
</p>

<p className="text-xs text-muted">
{helper.country}
</p>

<p className="mt-1 text-xs text-foreground">
{helper.skills}
</p>

{helper.experience ? (
<p className="mt-1 text-xs text-muted">
{helper.experience} yrs experience
</p>
) : null}

{helper.rate ? (
<p className="mt-1 text-xs text-muted">
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
className="mt-2 inline-block text-xs font-semibold text-[#159447]"
>
Contact on WhatsApp
</a>

</div>

</div>
))}
</div>
) : null}
</div>
))}

<div ref={messagesEndRef} />

</div>

<div className="border-t p-3 flex gap-2">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=>{ if(e.key==="Enter") searchHelpers() }}
placeholder="Example: helper who can cook"
disabled={loading}
className="flex-1 rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-foreground outline-none"
/>

<button
onClick={()=>searchHelpers()}
disabled={loading || !message.trim()}
className="rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white"
>

{loading ? "..." : "Ask"}

</button>

</div>

</div>

)}

{!open && (

<button
onClick={()=>setOpen(true)}
className="h-14 w-14 rounded-full bg-indigo-600 text-xl text-white shadow-xl"
>
🤖
</button>

)}

</div>

)

}
