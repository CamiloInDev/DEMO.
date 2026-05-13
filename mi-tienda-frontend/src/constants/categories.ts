import { Headphones, Gamepad, Monitor, Plug, Camera, type LucideIcon } from "lucide-react"

export interface CategoryInfo {
  name: string
  icon: LucideIcon
}

export const categories: CategoryInfo[] = [
  { name: "Audio", icon: Headphones },
  { name: "Gaming", icon: Gamepad },
  { name: "Monitores", icon: Monitor },
  { name: "Accesorios", icon: Plug },
  { name: "Cámaras", icon: Camera },
]

export const categoryIconMap: Record<string, LucideIcon> = Object.fromEntries(
  categories.map((c) => [c.name, c.icon])
) as Record<string, LucideIcon>

export const categoryColors: Record<string, string> = {
  Audio: "from-purple-500/20 to-purple-500/5",
  Gaming: "from-green-500/20 to-green-500/5",
  Monitores: "from-blue-500/20 to-blue-500/5",
  Accesorios: "from-amber-500/20 to-amber-500/5",
  Cámaras: "from-rose-500/20 to-rose-500/5",
}

export const categoryDescriptions: Record<string, string> = {
  Audio: "Sonido envolvente para cada momento",
  Gaming: "Domina el juego con el mejor equipo",
  Monitores: "Calidad visual para trabajo y gaming",
  Accesorios: "Lo que necesitas para completar tu setup",
  Cámaras: "Captura cada detalle en 4K",
}
