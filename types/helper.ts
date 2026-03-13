export type Helper = {
  id: string
  name: string
  country: string
  skills: string
  experience?: number | null
  photo_url?: string | null
  languages?: string | null
  description?: string | null
  whatsapp?: string | null
  rate?: string | null
}

export type ChatResponse = {
  helpers?: Helper[]
  reply?: string | null
  error?: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  helpers?: Helper[]
}
