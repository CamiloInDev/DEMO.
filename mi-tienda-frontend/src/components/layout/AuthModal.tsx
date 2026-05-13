import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"

interface AuthModalProps {
  mode: "login" | "register"
  onClose: () => void
  onSwitch: () => void
}

export function AuthModal({ mode, onClose, onSwitch }: AuthModalProps) {
  const { login, register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-border/30 bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-heading text-2xl font-bold text-foreground">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Accede a tu cuenta para comprar" : "Regístrate en segundos"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="auth-name" className="text-xs font-medium text-muted-foreground">Nombre</label>
              <Input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="mt-1.5 border-border/40 bg-muted/50" required />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="text-xs font-medium text-muted-foreground">Email</label>
            <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="mt-1.5 border-border/40 bg-muted/50" required />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-xs font-medium text-muted-foreground">Contraseña</label>
            <Input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="mt-1.5 border-border/40 bg-muted/50" required />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            {loading ? "..." : mode === "login" ? "Entrar" : "Crear cuenta gratis"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button onClick={onSwitch} className="font-medium text-primary hover:underline">
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  )
}
