import AuthForm from "@/components/AuthForm"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-3 text-gray-600">
        Sign up to browse protected helper profiles and photos.
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <AuthForm mode="signup" redirectTo={redirectTo} />
      </div>
    </main>
  )
}
