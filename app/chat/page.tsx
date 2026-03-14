import ChatPageClient from "@/components/ChatPageClient"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const promptValue = resolvedSearchParams.prompt
  const initialPrompt = Array.isArray(promptValue) ? promptValue[0] ?? "" : promptValue ?? ""

  return <ChatPageClient initialPrompt={initialPrompt} />
}
