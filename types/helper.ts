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
  summary?: string | null
  error?: string
}
