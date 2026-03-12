import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HelpersPage() {

  const { data: helpers } = await supabase
    .from("helpers")
    .select("*")
    .order("created_at", { ascending: false })

  return (

    <main className="max-w-6xl mx-auto px-6 py-16">

      <h1 className="text-3xl font-bold">
        Find Helpers
      </h1>

      <p className="text-gray-500 mt-2">
        Browse available domestic helpers
      </p>


      {/* Helpers Grid */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        {helpers?.map((helper) => (

          <div
            key={helper.id}
            className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white"
          >

            {/* Helper Photo */}

            <img
              src={helper.photo_url}
              className="w-full h-56 object-cover"
            />

            {/* Card Content */}

            <div className="p-4">

              <h3 className="font-semibold text-lg">
                {helper.name}
              </h3>

              <p className="text-gray-500 text-sm">
                {helper.country}
              </p>

              <p className="text-sm mt-2">
                {helper.skills}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {helper.experience} years experience
              </p>


              {/* Buttons */}

              <div className="flex gap-2 mt-4">

                <a
                  href={`/helper/${helper.id}`}
                  className="flex-1 border text-center py-2 rounded hover:bg-gray-50"
                >
                  Profile
                </a>

                <a
                  href="https://wa.me/959797949547"
                  target="_blank"
                  className="flex-1 bg-green-500 text-white text-center py-2 rounded hover:bg-green-600"
                >
                  Contact Helper
                </a>

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>

  )
}