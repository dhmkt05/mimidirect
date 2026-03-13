const DEFAULT_WHATSAPP_NUMBER = "959797949547"
const DEFAULT_HELPER_IMAGE = "/logo.png"

export function getHelperImageSrc(photoUrl?: string | null) {
  return photoUrl?.trim() ? photoUrl : DEFAULT_HELPER_IMAGE
}

export function getWhatsAppLink(phone?: string | null, message?: string) {
  const sanitizedPhone = phone?.replace(/\D/g, "") || DEFAULT_WHATSAPP_NUMBER

  if (!message) {
    return `https://wa.me/${sanitizedPhone}`
  }

  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`
}
