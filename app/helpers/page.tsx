/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
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

export default async function HelpersPage() {
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

  // If user not logged in
  if (!session) {
    redirect("/login?redirectTo=/helpers")
  }

  const { data, error } = await supabase
    .from("helpers")
    .select("*")
    .order("created_at", { ascending: false })
  const helpers = (data ?? []) as Helper[]

  return (

    <main className="max-w-6xl mx-auto px-6 py-16">

      <h1 className="text-3xl font-bold">
        Find Helpers
      </h1>

      <p className="text-gray-500 mt-2">
        Browse available domestic helpers
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not load helper profiles right now. Please try again shortly.
        </p>
      ) : null}


      {/* Helpers Grid */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        {helpers.map((helper) => (

          <div
            key={helper.id}
            className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white"
          >

            {/* Helper Photo */}

            <img
              src={getHelperImageSrc(helper.photo_url)}
              alt={helper.name}
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

                <Link
                  href={`/helpers/${helper.id}`}
                  className="flex-1 border text-center py-2 rounded hover:bg-gray-50"
                >
                  Profile
                </Link>

                <a
                  href={getWhatsAppLink(
                    helper.whatsapp,
                    `Hi, I am interested in ${helper.name} from MimiDirect.`
                  )}
                  target="_blank"
                  rel="noreferrer"
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
