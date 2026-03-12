"use client"

import { useState } from "react"

export default function ChatPage() {

const [message,setMessage] = useState("")
const [helpers,setHelpers] = useState<any[]>([])
const [loading,setLoading] = useState(false)

async function searchHelpers(){

if(!message.trim()) return

setLoading(true)

try{

const res = await fetch("/api/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message})
})

const data = await res.json()

if(data.helpers){
setHelpers(data.helpers)
}

}catch(err){
console.error("Search error:",err)
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

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

{helpers.map((helper)=>(
<div
key={helper.id}
className="border rounded-lg p-4 shadow bg-white"
>

<img
src={helper.photo_url || "/logo.png"}
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

<p className="text-sm mt-1">
{helper.experience} years experience
</p>

<a
href={`https://wa.me/959797949547?text=Hi I found ${helper.name} on MimiDirect`}
target="_blank"
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
