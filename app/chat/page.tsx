"use client"

import { useState } from "react"

import { getHelperImageSrc, getWhatsAppLink } from "@/lib/helper-utils"
import type { ChatResponse, Helper } from "@/types/helper"

/* eslint-disable @next/next/no-img-element */

export default function ChatPage() {

const [message,setMessage] = useState("")
const [helpers,setHelpers] = useState<Helper[]>([])
const [loading,setLoading] = useState(false)
const [error,setError] = useState<string | null>(null)
const [summary,setSummary] = useState<string | null>(null)

async function searchHelpers(){

if(!message.trim()) return

setLoading(true)
setError(null)
setSummary(null)

try{

const res = await fetch("/api/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message})
})

if(!res.ok){
const fallbackError = "We could not reach the AI helper search right now."
const errorData = await res.json().catch(() => null)
throw new Error(errorData?.error || fallbackError)
}

const data: ChatResponse = await res.json()

setHelpers(data.helpers || [])
setSummary(data.summary || null)

}catch(err){
setError(err instanceof Error ? err.message : "Search error. Please try again.")
}

setLoading(false)

}

return(

<main className="max-w-6xl mx-auto p-8">

<h1 className="text-2xl font-bold mb-6">
Mimi AI Assistant 🤖
</h1>

<div className="flex gap-3 mb-10">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
placeholder="Example: Myanmar cooking helper"
className="border p-3 w-full rounded"
onKeyDown={(e)=>{
if(e.key==="Enter") searchHelpers()
}}
/>

<button
onClick={searchHelpers}
className="bg-black text-white px-5 rounded"
>

{loading ? "Searching..." : "Ask AI"}

</button>

</div>

{error ? (
<p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
{error}
</p>
) : null}

{summary ? (
<p className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
{summary}
</p>
) : null}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

{helpers.map((helper)=>(
<div
key={helper.id}
className="border rounded-lg p-4 shadow bg-white"
>

<img
src={getHelperImageSrc(helper.photo_url)}
alt={helper.name}
className="w-full h-40 object-cover rounded"
/>

<h3 className="font-bold mt-3">
{helper.name}
</h3>

<p className="text-gray-500">
{helper.country}
</p>

<p className="mt-1 text-sm">
{helper.skills}
</p>

{helper.experience ? (
<p className="text-sm mt-1">
{helper.experience} years experience
</p>
) : null}

{helper.rate ? (
<p className="text-sm mt-1 text-gray-600">
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
className="block mt-3 bg-green-500 text-white text-center py-2 rounded"
>
Contact Helper
</a>

</div>
))}

</div>

</main>

)

}
