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

    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">

      <h1 className="text-3xl font-bold sm:text-4xl">
        Find Helpers
      </h1>

      <p className="mt-2 text-muted">
        Browse available domestic helpers
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not load helper profiles right now. Please try again shortly.
        </p>
      ) : null}


      {/* Helpers Grid */}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {helpers.map((helper) => (

          <div
            key={helper.id}
            className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition hover:shadow-lg"
          >

            {/* Helper Photo */}

            <img
              src={getHelperImageSrc(helper.photo_url)}
              alt={helper.name}
              className="h-56 w-full object-cover"
            />

            {/* Card Content */}

            <div className="p-5">

              <h3 className="text-lg font-semibold">
                {helper.name}
              </h3>

              <p className="text-sm text-muted">
                {helper.country}
              </p>

              <p className="mt-2 text-sm text-foreground">
                {helper.skills}
              </p>

              <p className="mt-1 text-sm text-muted">
                {helper.experience} years experience
              </p>


              {/* Buttons */}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                <Link
                  href={`/helpers/${helper.id}`}
                  className="flex-1 rounded-full border border-border py-2 text-center text-sm font-semibold text-foreground hover:bg-surface-strong"
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
                  className="flex-1 rounded-full bg-[#25D366] py-2 text-center text-sm font-semibold text-white"
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
