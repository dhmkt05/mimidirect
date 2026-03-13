/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

import { getHelperImageSrc } from "@/lib/helper-utils"
import type { Helper } from "@/types/helper"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HomePage(){

const { data, error } = await supabase
.from("helpers")
.select("*")
.limit(6)
const helpers = (data ?? []) as Helper[]

return(

<main className="max-w-6xl mx-auto px-6 py-20">

{/* HERO */}

<section className="text-center">

<h1 className="text-5xl font-bold">
Find. Hire. Direct.
</h1>

<p className="text-gray-500 mt-4 max-w-xl mx-auto">
Use AI to instantly find trusted domestic helpers.
</p>

<div className="mt-8 flex justify-center gap-4">

<Link
href="/chat"
className="bg-black text-white px-6 py-3 rounded"
>
Ask AI
</Link>

<Link
href="/helpers"
className="border px-6 py-3 rounded"
>
Browse Helpers
</Link>

</div>

</section>


{/* HELPERS */}

<section className="mt-24">

<h2 className="text-2xl font-bold text-center">
Available Helpers
</h2>

{error ? (
<p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
We could not load helpers right now. Please try again shortly.
</p>
) : null}

<div className="grid md:grid-cols-3 gap-6 mt-10">

{helpers?.map((helper)=>(
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

<p className="text-sm mt-1">
{helper.skills}
</p>

<p className="text-sm mt-1">
{helper.experience} years experience
</p>

<Link
href={`/helpers/${helper.id}`}
className="block mt-3 border text-center py-2 rounded"
>
View Profile
</Link>

</div>
))}

</div>

</section>

</main>

)

}
