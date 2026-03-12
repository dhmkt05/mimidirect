"use client"

import { useState } from "react"

export default function AIChatWidget(){

const [open,setOpen] = useState(true)
const [message,setMessage] = useState("")
const [helpers,setHelpers] = useState<any[]>([])
const [loading,setLoading] = useState(false)

async function searchHelpers(msg?:string){

const query = msg || message

if(!query.trim()) return

setLoading(true)

const res = await fetch("/api/chat",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({message:query})
})

const data = await res.json()

setHelpers(data.helpers || [])

setLoading(false)
setMessage("")
}

return(

<div className="fixed bottom-6 right-6 z-50">

{open && (

<div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">

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
Hi 👋 I'm Mimi AI. Tell me what kind of helper you need.
</div>

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
className="border rounded-xl p-3 flex gap-3 shadow-sm"
>

<img
src={helper.photo_url}
className="w-14 h-14 rounded-lg object-cover"
/>

<div className="flex-1 text-sm">

<p className="font-semibold">
{helper.name}
</p>

<p className="text-gray-500 text-xs">
{helper.country} • {helper.experience} yrs
</p>

<p className="text-xs mt-1">
{helper.skills}
</p>

<a
href={`https://wa.me/${helper.whatsapp}`}
target="_blank"
className="inline-block mt-2 text-green-600 text-xs font-medium"
>
Contact on WhatsApp
</a>

</div>

</div>

))}

</div>

<div className="border-t p-3 flex gap-2">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=>{ if(e.key==="Enter") searchHelpers() }}
placeholder="Example: helper who can cook"
className="border rounded-lg px-3 py-2 flex-1 text-sm"
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