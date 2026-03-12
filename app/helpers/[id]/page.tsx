import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HelperPage({ params }: any){

const { data: helper } = await supabase
.from("helpers")
.select("*")
.eq("id", params.id)
.single()

if(!helper){
return <div className="p-10">Helper not found</div>
}

return(

<main className="max-w-4xl mx-auto p-10">

<img
src={helper.photo_url}
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
href="https://wa.me/959797949547"
target="_blank"
className="inline-block mt-6 bg-green-500 text-white px-6 py-3 rounded"
>
Contact on WhatsApp
</a>

</main>

)

}