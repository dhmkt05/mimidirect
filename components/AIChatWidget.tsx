"use client"

import { useState } from "react"

import { getHelperImageSrc, getWhatsAppLink } from "@/lib/helper-utils"
import type { ChatResponse, Helper } from "@/types/helper"

/* eslint-disable @next/next/no-img-element */

export default function AIChatWidget(){

const [open,setOpen] = useState(true)
const [message,setMessage] = useState("")
const [helpers,setHelpers] = useState<Helper[]>([])
const [loading,setLoading] = useState(false)
const [error,setError] = useState<string | null>(null)

async function searchHelpers(msg?:string){

const query = msg || message

if(!query.trim()) return

setLoading(true)
setError(null)
setHelpers([])

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

setHelpers(data.helpers || [])
setMessage("")
} catch (err) {
setError(err instanceof Error ? err.message : "Search error. Please try again.")
} finally {
setLoading(false)
}
}

return(

<div className="fixed bottom-6 right-6 z-50">

{open && (

<div className="flex h-[520px] w-[calc(100vw-2rem)] max-w-[360px] flex-col rounded-2xl border border-border bg-surface shadow-2xl">

<div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">

<div className="flex items-center gap-2">
<span className="text-lg">🤖</span>
<p className="font-semibold">Mimi AI Assistant</p>
</div>

<button onClick={()=>setOpen(false)} className="text-white text-sm">
✕
</button>

</div>

<div className="flex-1 overflow-y-auto p-4 space-y-4">

<div className="bg-gray-100 p-3 rounded-xl text-sm">
Hi 👋 I&apos;m Mimi AI. Tell me what kind of helper you need.
</div>

{error ? (
<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
{error}
</div>
) : null}

<div className="flex flex-wrap gap-2">

<button
onClick={()=>searchHelpers("Cooking helper")}
className="text-xs bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
>
Cooking
</button>

<button
onClick={()=>searchHelpers("Childcare helper")}
className="text-xs bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
>
Childcare
</button>

<button
onClick={()=>searchHelpers("Elderly care helper")}
className="text-xs bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
>
Elderly Care
</button>

<button
onClick={()=>searchHelpers("Myanmar helper")}
className="text-xs bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
>
Myanmar
</button>

</div>

{helpers.map((helper)=>(

<div
key={helper.id}
className="flex gap-3 rounded-xl border border-border bg-surface-strong p-3 shadow-sm"
>

<img
src={getHelperImageSrc(helper.photo_url)}
alt={helper.name}
className="w-14 h-14 rounded-lg object-cover"
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

{!loading && !error && helpers.length === 0 ? (
<div className="rounded-xl border border-border bg-surface-strong p-3 text-sm text-muted">
No helper cards matched yet. Try “Cooking helper” or “Myanmar helper”.
</div>
) : null}

</div>

<div className="border-t p-3 flex gap-2">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=>{ if(e.key==="Enter") searchHelpers() }}
placeholder="Example: helper who can cook"
className="flex-1 rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-foreground outline-none"
/>

<button
onClick={()=>searchHelpers()}
className="bg-indigo-600 text-white px-4 rounded-lg text-sm"
>

{loading ? "..." : "Ask"}

</button>

</div>

</div>

)}

{!open && (

<button
onClick={()=>setOpen(true)}
className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-xl text-xl"
>
🤖
</button>

)}

</div>

)

}
