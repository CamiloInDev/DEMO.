import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { useAuth } from "@/lib/auth"
import { updateProfile } from "@/lib/api"

export function AccountPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  })

  useEffect(() => {
    document.title = "Market - Mi cuenta"
  }, [])

  if (!user) {
    navigate("/")
    return null
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const data: Record<string, any> = {}
      if (form.full_name !== user.full_name) data.full_name = form.full_name
      if (form.email !== user.email) data.email = form.email
      if (form.phone !== (user.phone ?? "")) data.phone = form.phone
      if (form.address !== (user.address ?? "")) data.address = form.address
      if (form.password) data.password = form.password
      if (Object.keys(data).length === 0) { setSaving(false); return }
      const result = await updateProfile(data)
      updateUser({ full_name: result.full_name, email: result.email, phone: result.phone, address: result.address })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch { console.error("Error al guardar") }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MorphingBackground />
      <Header cartItems={[]} onRemoveFromCart={() => {}} totalPrice={0} onOpenAuth={() => {}} />
      <main className="mx-auto max-w-2xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a tienda
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mi cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tu información personal</p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><User className="h-3 w-3" /> Nombre</label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 border-border/40 bg-muted/50" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Mail className="h-3 w-3" /> Email</label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 border-border/40 bg-muted/50" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Phone className="h-3 w-3" /> Teléfono</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+34 600 000 000" className="mt-1 border-border/40 bg-muted/50" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><MapPin className="h-3 w-3" /> Dirección de envío</label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle, número, ciudad, código postal" className="mt-1 border-border/40 bg-muted/50" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Lock className="h-3 w-3" /> Nueva contraseña (opcional)</label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Dejar vacío para mantener actual" className="mt-1 border-border/40 bg-muted/50" />
          </div>
        </div>

        <Button className="mt-8 w-full gap-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Guardando..." : success ? "✓ Guardado" : "Guardar cambios"}
        </Button>
      </main>
      <Footer />
    </div>
  )
}
