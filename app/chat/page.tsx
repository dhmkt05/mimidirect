"use client"

import { useState } from "react"

import { getHelperImageSrc, getWhatsAppLink } from "@/lib/helper-utils"
import type { ChatMessage, ChatResponse, Helper } from "@/types/helper"

/* eslint-disable @next/next/no-img-element */

export default function ChatPage() {

const [message,setMessage] = useState("")
const [messages,setMessages] = useState<ChatMessage[]>([
{
id: "welcome",
role: "assistant",
content:
"Hello! I can chat normally and also help you find domestic helpers. Tell me what you need, or just say hi.",
},
])
const [loading,setLoading] = useState(false)
const [error,setError] = useState<string | null>(null)

async function searchHelpers(){
const trimmedMessage = message.trim()

if(!trimmedMessage) return

const userMessage: ChatMessage = {
id: `${Date.now()}-user`,
role: "user",
content: trimmedMessage,
}

setLoading(true)
setError(null)
setMessage("")
setMessages((current) => [...current, userMessage])

try{

const res = await fetch("/api/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message:trimmedMessage})
})

if(!res.ok){
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

}catch(err){
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

return(

<main className="max-w-6xl mx-auto p-8">

<h1 className="mb-3 text-3xl font-bold sm:text-4xl">
Mimi AI Assistant 🤖
</h1>

<p className="mb-8 max-w-2xl text-muted">
Describe the kind of helper you need and MimiDirect AI will return simple helper cards you can contact directly.
</p>

<div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
placeholder="Example: Myanmar cooking helper"
className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none"
onKeyDown={(e)=>{
if(e.key==="Enter") searchHelpers()
}}
/>

<button
onClick={searchHelpers}
className="rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-contrast sm:px-6"
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
{messages.map((entry)=>(
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
{entry.helpers.map((helper: Helper)=>(
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
</div>

{!loading && !error && messages.length === 1 ? (
<p className="mt-8 rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
Start with a greeting or ask for something like “I need a Myanmar cooking helper with childcare experience.”
</p>
) : null}

</main>

)

}
