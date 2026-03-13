/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

import { getHelperImageSrc, getWhatsAppLink } from "@/lib/helper-utils"
import type { Helper } from "@/types/helper"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HelperPage({
params,
}: {
params: Promise<{ id: string }>
}){
const { id } = await params
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
// Server components can read cookies without always being able to write them.
}
},
},
}
)

const {
data: { session },
} = await supabaseAuth.auth.getSession()

if (!session) {
redirect(`/login?redirectTo=/helpers/${id}`)
}

const { data, error } = await supabase
.from("helpers")
.select("*")
.eq("id", id)
.single()
const helper = data as Helper | null

if(error || !helper){
return <div className="p-10">Helper not found</div>
}

return(

<main className="max-w-4xl mx-auto p-10">

<img
src={getHelperImageSrc(helper.photo_url)}
alt={helper.name}
className="w-64 rounded-lg"
/>

<h1 className="text-3xl font-bold mt-6">
{helper.name}
</h1>

<p className="text-gray-500 mt-2">
{helper.country}
</p>

<p className="mt-4">
Skills: {helper.skills}
</p>

<p className="mt-2">
Experience: {helper.experience} years
</p>

<p className="mt-2">
Languages: {helper.languages}
</p>

<p className="mt-4">
{helper.description}
</p>

<a
href={getWhatsAppLink(
helper.whatsapp,
`Hi, I am interested in ${helper.name} from MimiDirect.`
)}
target="_blank"
rel="noreferrer"
className="inline-block mt-6 bg-green-500 text-white px-6 py-3 rounded"
>
Contact on WhatsApp
</a>

</main>

)

}
