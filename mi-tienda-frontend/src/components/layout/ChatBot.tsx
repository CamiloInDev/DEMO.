import { useState } from "react"
import { MessageSquareMore, X } from "lucide-react"

const N8N_URL = "https://n8n.skatmaskacore.com/webhook/61ddeb53-8db2-40aa-a601-c01d435fba67/chat"

export function ChatBot() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div className="fixed bottom-32 right-6 z-50 w-[360px] h-[520px] rounded-2xl border border-[#C7A304]/20 bg-[#1A1614] shadow-2xl shadow-[#C7A304]/15 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-[#C7A304] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/15">
                <MessageSquareMore className="h-4 w-4 text-[#1A1614]" />
              </div>
              <span className="font-heading text-sm font-semibold text-[#1A1614]">Market Asistente</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-[#1A1614]/70 transition-colors hover:bg-black/15 hover:text-[#1A1614]"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe
            src={N8N_URL}
            className="h-full w-full flex-1 border-0"
            title="Chatbot asistente"
          />
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#C7A304] text-[#1A1614] shadow-lg shadow-[#C7A304]/30 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-[#C7A304]/40 active:scale-95"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquareMore className="h-5 w-5" />}
      </button>
    </>
  )
}
