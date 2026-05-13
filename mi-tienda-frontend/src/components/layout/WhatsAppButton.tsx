import { MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "1234567890"
const WHATSAPP_MESSAGE = "Hola! Quiero hacer una consulta sobre productos."

export function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:bg-green-400 hover:scale-110 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
